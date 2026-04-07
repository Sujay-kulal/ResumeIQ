import React from 'react';

export default function Sidebar({ currentView, onNavigate, onLogout }) {
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Dashboard' },
    { id: 'analyze', icon: '🔍', label: 'Analyze Resume' },
    { id: 'build', icon: '✨', label: 'Build Resume' },
    { id: 'github', icon: '🐙', label: 'GitHub Projects' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon" aria-hidden="true">✦</div>
        <span className="sidebar-logo-text">ResumeIQ</span>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <span className="sidebar-nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-nav-item logout-btn" onClick={onLogout} type="button">
          <span className="sidebar-nav-icon" aria-hidden="true">🚪</span>
          <span className="sidebar-nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
