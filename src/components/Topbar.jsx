import React, { useState } from 'react';

export default function Topbar({ user, theme, onToggleTheme, currentView, onNavigate }) {
  const [showUserCard, setShowUserCard] = useState(false);

  const viewTitles = {
    home:     'Dashboard Home',
    analyze:  'Analyze Resume',
    build:    'Build Resume',
    github:   'GitHub Integrations',
    settings: 'Settings',
  };

  const displayName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'User';
  const email       = user?.email || '';
  const photoURL    = user?.photoURL || user?.photo || null;
  const initial     = displayName.charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{viewTitles[currentView] || 'Overview'}</h1>
      </div>

      <div className="topbar-right">
        {currentView !== 'build' && (
          <button
            className="btn btn-primary topbar-new-btn"
            onClick={() => onNavigate('build')}
            type="button"
          >
            <span aria-hidden="true">✨</span>
            <span className="topbar-new-label">New Resume</span>
          </button>
        )}

        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          type="button"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {}
        <div
          className="topbar-user-profile"
          onClick={() => setShowUserCard(v => !v)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setShowUserCard(false); }}
          tabIndex={0}
          role="button"
          aria-label="User profile"
          aria-expanded={showUserCard}
        >
          {}
          <div className="topbar-avatar-wrap">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="topbar-avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="topbar-avatar-fallback" aria-hidden="true">
                {initial}
              </div>
            )}
            <span className="topbar-avatar-status" aria-hidden="true" />
          </div>

          {}
          <div className="topbar-user-info">
            <span className="topbar-user-name">{displayName}</span>
            {email && <span className="topbar-user-email">{email}</span>}
          </div>

          {}
          <span className="topbar-chevron" aria-hidden="true">
            {showUserCard ? '▲' : '▾'}
          </span>

          {}
          {showUserCard && (
            <div className="topbar-user-dropdown" role="menu">
              <div className="topbar-dropdown-header">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="topbar-dropdown-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="topbar-dropdown-avatar-fallback">{initial}</div>
                )}
                <div className="topbar-dropdown-info">
                  <div className="topbar-dropdown-name">{displayName}</div>
                  {email && <div className="topbar-dropdown-email">{email}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
