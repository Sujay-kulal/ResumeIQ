import React from 'react';

export default function DashboardHome({ onNavigate, hasData, lastScore }) {
  if (!hasData) {
    return (
      <div className="dashboard-home empty-state">
        <div className="onboarding-panel">
          <div className="onboarding-icon" aria-hidden="true">🚀</div>
          <h2 className="onboarding-title">Start Building a Strong Resume</h2>
          <p className="onboarding-subtitle">Choose one to get started. You can switch anytime.</p>
          
          <div className="onboarding-options">
            <button className="onboarding-card" onClick={() => onNavigate('analyze')} type="button">
              <span className="onboarding-card-icon">🔍</span>
              <h3>Analyze Existing Resume</h3>
              <p>Upload a PDF/DOCX to get an ATS score and feedback.</p>
            </button>
            <button className="onboarding-card" onClick={() => onNavigate('build')} type="button">
              <span className="onboarding-card-icon">✨</span>
              <h3>Build New Resume</h3>
              <p>Create an ATS-friendly resume from scratch with AI.</p>
            </button>
            <button className="onboarding-card" onClick={() => onNavigate('github')} type="button">
              <span className="onboarding-card-icon">🐙</span>
              <h3>Import from GitHub</h3>
              <p>Fetch your repositories and generate project bullets.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home returning-state">
      <div className="dashboard-grid">
        {}
        <div className="dashboard-card last-resume-card">
          <div className="last-resume-header">
            <h3>Your Last Resume</h3>
            <span className="last-updated">Updated today</span>
          </div>
          <div className="ats-score-display">
            <div className="ats-score-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${lastScore || 0}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">{Math.round(lastScore || 0)}</text>
              </svg>
            </div>
            <div className="ats-score-info">
              <p className="ats-score-label">Overall ATS Score</p>
              <p className="ats-score-desc">
                {lastScore >= 80 ? 'Excellent! This resume is highly competitive.' : 'Needs improvement. Follow suggestions to boost your score.'}
              </p>
            </div>
          </div>
          <div className="last-resume-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('analyze')} type="button">
              Continue Editing
            </button>
          </div>
        </div>

        {}
        <div className="dashboard-card quick-actions-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-list">
            <button className="quick-action-btn" onClick={() => onNavigate('analyze')} type="button">
              <span className="quick-action-icon">🔍</span> Analyze Resume
            </button>
            <button className="quick-action-btn" onClick={() => onNavigate('build')} type="button">
              <span className="quick-action-icon">✨</span> Build Resume
            </button>
            <button className="quick-action-btn" onClick={() => onNavigate('github')} type="button">
              <span className="quick-action-icon">🐙</span> Import GitHub Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
