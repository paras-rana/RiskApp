const API_BASE = 'http://localhost:3000';

export async function apiFetch(path, { token, headers, onUnauthorized, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(headers ?? {}),
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  });

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  return response;
}
