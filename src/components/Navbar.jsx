import { useEffect, useRef, useState } from 'react';

export default function Navbar({ theme, onToggleTheme, mode, onModeSwitch, user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Support both Firebase user (displayName) and legacy user (name)
  const displayName = user?.displayName || user?.name || 'User';
  const displayEmail = user?.email || '';
  const photoURL = user?.photoURL || user?.photo;

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="navbar" role="banner">
      <div className="container navbar-inner">

        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon" aria-hidden="true">✦</div>
          <span className="navbar-logo-text">ResumeIQ</span>
        </div>

        {/* Center: Mode Toggle (only when logged in) */}
        {user && onModeSwitch && (
          <nav className="navbar-mode-toggle" role="tablist" aria-label="Choose mode">
            <button
              id="nav-tab-analyze"
              role="tab"
              aria-selected={mode === 'analyze'}
              className={`navbar-mode-btn ${mode === 'analyze' ? 'active' : ''}`}
              onClick={() => onModeSwitch('analyze')}
              type="button"
            >
              <span aria-hidden="true">🔍</span>
              <span className="navbar-mode-label">Analyze</span>
            </button>
            <button
              id="nav-tab-build"
              role="tab"
              aria-selected={mode === 'build'}
              className={`navbar-mode-btn ${mode === 'build' ? 'active' : ''}`}
              onClick={() => onModeSwitch('build')}
              type="button"
            >
              <span aria-hidden="true">✨</span>
              <span className="navbar-mode-label">Build</span>
            </button>
          </nav>
        )}

        {/* Right: Theme + Badge + User */}
        <div className="navbar-right">
          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </span>
          </button>

          {/* AI badge (hidden on mobile) */}
          {!user && (
            <div className="navbar-badge" aria-label="AI Powered">AI POWERED</div>
          )}

          {/* User avatar + dropdown */}
          {user && (
            <div className="navbar-user" ref={dropRef}>
              <button
                id="user-avatar-btn"
                className="navbar-avatar-btn"
                onClick={() => setDropdownOpen(o => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
                type="button"
                title={displayName}
              >
                {photoURL
                  ? <img src={photoURL} alt={displayName} className="navbar-avatar-img" />
                  : initials
                }
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown" role="menu">
                  <div className="navbar-dropdown-name">{displayName}</div>
                  <div className="navbar-dropdown-email">{displayEmail}</div>
                  <button
                    role="menuitem"
                    className="navbar-dropdown-item danger"
                    type="button"
                    onClick={() => { setDropdownOpen(false); onLogout?.(); }}
                  >
                    <span aria-hidden="true">🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
