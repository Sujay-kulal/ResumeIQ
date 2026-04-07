export default function Hero({ onGetStarted }) {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-heading">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      <div className="container">
        <div className="hero-content">
          <div className="hero-tag" role="status">
            <span className="hero-tag-dot" aria-hidden="true" />
            Powered by Google Gemini 1.5 Flash
          </div>

          <h1 className="hero-title" id="hero-heading">
            Your Resume Gets Rejected
            <br />
            <span className="hero-title-gradient">Before Humans See It.</span>
          </h1>

          <p className="hero-subtitle">
            Analyze, optimize, and build ATS-friendly resumes with real-time feedback.
            Upload your resume and get a precision ATS score in seconds.
          </p>

          {/* Trust signals */}
          <div className="hero-stats" role="list" aria-label="Trust signals">
            <div className="hero-stat" role="listitem">
              <div className="hero-stat-value">6+</div>
              <div className="hero-stat-label">Dimensions Scored</div>
            </div>
            <div className="hero-stat" role="listitem">
              <div className="hero-stat-value">ATS</div>
              <div className="hero-stat-label">40/20/20/20 Formula</div>
            </div>
            <div className="hero-stat" role="listitem">
              <div className="hero-stat-value">0ms</div>
              <div className="hero-stat-label">Network Requests</div>
            </div>
          </div>

          <button
            id="hero-cta-btn"
            className="btn btn-primary btn-lg"
            onClick={onGetStarted}
            aria-label="Start analyzing your resume"
          >
            <span aria-hidden="true">⚡</span>
            Analyze My Resume
          </button>

          {/* Privacy trust row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🔒 Privacy-first: No data stored</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⚡ Runs locally in your browser</span>
          </div>
        </div>
      </div>
    </section>
  );
}
