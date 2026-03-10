import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import Icon from './Icon';

export default function AppFrame({
  title,
  description,
  children,
  detailLabel = null,
  topNavActions = null,
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <header className="page-header page-header-split">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <div className="session-menu" ref={menuRef}>
          <button
            type="button"
            className="session-panel session-trigger"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <div className="session-name">{user?.name || user?.email || 'Unknown user'}</div>
            <Icon name="chevronDown" className={`session-caret ${menuOpen ? 'is-open' : ''}`} />
          </button>

          {menuOpen ? (
            <div className="session-dropdown">
              <button type="button" className="session-action" onClick={logout}>
                <Icon name="signout" />
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="top-nav top-nav-wide">
        <div className="top-nav-links">
          <NavLink
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/dashboard"
          >
            <Icon name="dashboard" />
            Dashboard
          </NavLink>
          <NavLink
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/risks"
          >
            <Icon name="register" />
            Risk Register
          </NavLink>
          {detailLabel ? (
            <span className="nav-link active">
              <Icon name="detail" />
              {detailLabel}
            </span>
          ) : null}
        </div>

        <div className="top-nav-actions">{topNavActions}</div>
      </div>

      {children}
    </div>
  );
}
