import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { WORKSPACES } from '../lib/workspace';
import Icon from './Icon';

const SECTION_BAND_CLASSES = [
  'band-purple',
  'band-orange',
  'band-green',
  'band-blue',
  'band-red',
];

function hasBandTarget(className = '') {
  const classNames = className.split(/\s+/).filter(Boolean);
  return classNames.includes('panel') || classNames.includes('detail-section-banded');
}

function applySectionBands(node, state) {
  if (!isValidElement(node)) {
    return node;
  }

  const nextProps = {};
  const className = typeof node.props.className === 'string' ? node.props.className : '';

  if (hasBandTarget(className)) {
    const bandClass = SECTION_BAND_CLASSES[state.index % SECTION_BAND_CLASSES.length];
    state.index += 1;
    nextProps.className = `${className} ${bandClass}`.trim();
  }

  if (node.props.children) {
    nextProps.children = Children.map(node.props.children, (child) => applySectionBands(child, state));
  }

  return Object.keys(nextProps).length > 0 ? cloneElement(node, nextProps) : node;
}

export default function AppFrame({
  title,
  description,
  children,
  detailLabel = null,
  topNavActions = null,
}) {
  const { user, logout, workspace, setWorkspace } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const sessionIconName = workspace === WORKSPACES.PPM ? 'portfolio' : 'risk';
  const sessionBandClass = workspace === WORKSPACES.PPM ? 'band-blue' : 'band-orange';
  const headerBandClass = workspace === WORKSPACES.PPM ? 'band-blue' : 'band-orange';
  const bandState = { index: 1 };
  const bandedChildren = Children.map(children, (child) => applySectionBands(child, bandState));

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
      <div className="app-layout">
        <aside className="side-nav">
          <div className="side-nav-brand">
            <div className="side-nav-logo-placeholder" aria-label="Application logo placeholder">
              <div className="side-nav-logo-mark" aria-hidden="true" />
            </div>
          </div>

          <nav className="side-nav-links" aria-label="Primary navigation">
            <NavLink
              end
              className={({ isActive }) => `nav-link side-nav-link band-purple ${isActive ? 'active' : ''}`}
              to="/dashboard"
              aria-label={workspace === WORKSPACES.PPM ? 'Portfolio Dashboard' : 'Risk Dashboard'}
              data-label={workspace === WORKSPACES.PPM ? 'Portfolio Dashboard' : 'Risk Dashboard'}
            >
              <Icon name="dashboard" />
              <span className="side-nav-link-label">
                {workspace === WORKSPACES.PPM ? 'Portfolio Dashboard' : 'Risk Dashboard'}
              </span>
            </NavLink>
            {workspace === WORKSPACES.ERM ? (
              <NavLink
                end
                className={({ isActive }) => `nav-link side-nav-link band-orange ${isActive ? 'active' : ''}`}
                to="/risks"
                aria-label="Risk Register"
                data-label="Risk Register"
              >
                <Icon name="register" />
                <span className="side-nav-link-label">Risk Register</span>
              </NavLink>
            ) : null}
            {workspace === WORKSPACES.PPM ? (
              <>
                <NavLink
                  end
                  className={({ isActive }) => `nav-link side-nav-link band-orange ${isActive ? 'active' : ''}`}
                  to="/ppm/current"
                  aria-label="Current Projects"
                  data-label="Current Projects"
                >
                  <Icon name="dashboard" />
                  <span className="side-nav-link-label">Current Projects</span>
                </NavLink>
                <NavLink
                  end
                  className={({ isActive }) => `nav-link side-nav-link band-green ${isActive ? 'active' : ''}`}
                  to="/ppm/future"
                  aria-label="Future Projects"
                  data-label="Future Projects"
                >
                  <Icon name="portfolio" />
                  <span className="side-nav-link-label">Future Projects</span>
                </NavLink>
                <NavLink
                  end
                  className={({ isActive }) => `nav-link side-nav-link band-blue ${isActive ? 'active' : ''}`}
                  to="/ppm/register"
                  aria-label="Portfolio Register"
                  data-label="Portfolio Register"
                >
                  <Icon name="register" />
                  <span className="side-nav-link-label">Portfolio Register</span>
                </NavLink>
                <NavLink
                  end
                  className={({ isActive }) => `nav-link side-nav-link band-purple ${isActive ? 'active' : ''}`}
                  to="/ppm/submit"
                  aria-label="Submit Project"
                  data-label="Submit Project"
                >
                  <Icon name="plus" />
                  <span className="side-nav-link-label">Submit Project</span>
                </NavLink>
                <NavLink
                  end
                  className={({ isActive }) => `nav-link side-nav-link band-red ${isActive ? 'active' : ''}`}
                  to="/ppm/review"
                  aria-label="Review Queue"
                  data-label="Review Queue"
                >
                  <Icon name="review" />
                  <span className="side-nav-link-label">Review Queue</span>
                </NavLink>
                <NavLink
                  end
                  className={({ isActive }) => `nav-link side-nav-link band-purple ${isActive ? 'active' : ''}`}
                  to="/ppm/strategic-priorities"
                  aria-label="Strategic Priorities"
                  data-label="Strategic Priorities"
                >
                  <Icon name="assessment" />
                  <span className="side-nav-link-label">Strategic Priorities</span>
                </NavLink>
                <NavLink
                  end
                  className={({ isActive }) => `nav-link side-nav-link band-orange ${isActive ? 'active' : ''}`}
                  to="/ppm/operational-initiatives"
                  aria-label="Annual Operational Initiatives"
                  data-label="Annual Operational Initiatives"
                >
                  <Icon name="portfolio" />
                  <span className="side-nav-link-label">Annual Operational Initiatives</span>
                </NavLink>
              </>
            ) : null}
            {detailLabel ? (
              <span
                className="nav-link side-nav-link band-blue active"
                aria-label={detailLabel}
                data-label={detailLabel}
              >
                <Icon name="detail" />
                <span className="side-nav-link-label">{detailLabel}</span>
              </span>
            ) : null}
          </nav>

          <div className="side-nav-footer">
            <div className="session-menu" ref={menuRef}>
              <button
                type="button"
                className={`session-panel session-trigger ${sessionBandClass}`}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <div className="session-user-row">
                  <Icon name={sessionIconName} className="session-user-icon" />
                  <div className="session-name">{user?.name || user?.email || 'Unknown user'}</div>
                </div>
              </button>

              {menuOpen ? (
                <div className="session-dropdown">
                  {[WORKSPACES.ERM, WORKSPACES.PPM].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`workspace-chip session-inline-btn ${workspace === option ? 'active' : ''}`}
                      onClick={() => {
                        setWorkspace(option);
                        setMenuOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}

                  <button type="button" className="session-action session-inline-btn" onClick={logout}>
                    <Icon name="signout" />
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <main className="app-content">
          <header className={`page-header page-header-split ${headerBandClass}`}>
            <div>
              <h1>
                {detailLabel ? (
                  <>
                    <span className="page-header-detail-label">{detailLabel}</span>
                    <span className="page-header-divider">|</span>
                  </>
                ) : null}
                {title}
              </h1>
              <p>{description}</p>
            </div>

            <div className="page-header-actions">
              {topNavActions}
            </div>
          </header>

          {bandedChildren}
        </main>
      </div>
    </div>
  );
}
