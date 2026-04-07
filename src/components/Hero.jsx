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
            Transform Your Resume
            <br />
            <span className="hero-title-gradient">Into an Opportunity</span>
          </h1>

          <p className="hero-subtitle">
            Get a professional ATS analysis in seconds — no API key, no login, no data sent anywhere.
            Upload your resume, pick a target role, and get precision scores instantly.
          </p>

          <div className="hero-stats" role="list" aria-label="Platform statistics">
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
        </div>
      </div>
    </section>
  );
}
