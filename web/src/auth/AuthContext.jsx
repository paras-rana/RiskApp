import { useEffect, useState } from 'react';
import { AuthContext } from './authContextValue';

const API_BASE = 'http://localhost:3000';
const AUTH_STORAGE_KEY = 'riskapp.auth';

function readStoredSession() {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    async function validateSession() {
      const stored = readStoredSession();
      if (!stored?.token) {
        setSession(null);
        setAuthReady(true);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const nextSession = {
          ...stored,
          user: data.user,
        };

        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setSession(null);
      } finally {
        setAuthReady(true);
      }
    }

    void validateSession();
  }, []);

  async function login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    const nextSession = {
      token: data.token,
      user: data.user,
      expiresAt: data.expiresAt,
    };

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  }

  function logout() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        authReady,
        isAuthenticated: Boolean(session?.token),
        token: session?.token ?? '',
        user: session?.user ?? null,
        expiresAt: session?.expiresAt ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
