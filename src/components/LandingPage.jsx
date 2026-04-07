import { useEffect, useRef, useState } from 'react';

const FEATURES = [
  { icon: '🔒', title: '100% Private',    desc: 'No data leaves your browser. Zero network requests during analysis.' },
  { icon: '📊', title: 'ATS Score',        desc: 'Weighted scoring: Skills×40% + Experience×20% + Projects×20% + Format×20%.' },
  { icon: '⚡', title: 'Instant Results', desc: 'Full ATS report generated locally in under 2 seconds.' },
  { icon: '🎯', title: '30+ Roles',        desc: 'Tailored keyword libraries for every tech role.' },
  { icon: '✍️', title: 'Bullet Rewrites', desc: 'Action-verb rewrites to turn weak bullets into powerful impact statements.' },
  { icon: '🐙', title: 'GitHub Sync',      desc: 'Fetch & select your best repos to auto-populate the projects section.' },
];

const STEPS = [
  { num: '01', title: 'Select Your Role',     desc: 'Choose from 30+ tech roles or enter a custom one.' },
  { num: '02', title: 'Upload Resume',        desc: 'Drop your PDF or DOCX — stays 100% in your browser.' },
  { num: '03', title: 'Get ATS Score',        desc: 'Instant analysis with section-by-section breakdown.' },
  { num: '04', title: 'Fix & Improve',        desc: 'Apply AI-suggested rewrites and keyword additions.' },
];

function HeroScoreRing() {
  const circumference = 502;
  const fillRef = useRef(null);
  const [displayed, setDisplayed] = useState(0);
  const TARGET = 87;

  useEffect(() => {
    const delay = setTimeout(() => {
      let start = 0;
      const duration = 2200;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(eased * TARGET));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      if (fillRef.current) {
        const offset = circumference - (TARGET / 100) * circumference;
        requestAnimationFrame(() => {
          if (fillRef.current) fillRef.current.style.strokeDashoffset = offset;
        });
      }
    }, 700);
    return () => clearTimeout(delay);
  }, []);

  return (
    <div className="lp-ring-wrap" role="img" aria-label="ATS Score 87 out of 100">
      <svg width="200" height="200" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <defs>
          <linearGradient id="lp-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="lp-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          ref={fillRef}
          cx="90" cy="90" r="80"
          fill="none"
          stroke="url(#lp-ring-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#lp-glow)"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
            transition: 'stroke-dashoffset 2.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </svg>
      <div className="lp-ring-center">
        <div className="lp-ring-value" style={{ color: '#10b981' }}>{displayed}</div>
        <div className="lp-ring-sublabel">ATS Score</div>
        <div className="lp-ring-grade" style={{ color: '#10b981' }}>Excellent</div>
      </div>
    </div>
  );
}

export default function LandingPage({ onAnalyze, onBuild }) {
  return (
    <div className="lp-page">
      {}
      <div className="lp-orb lp-orb-1" aria-hidden="true" />
      <div className="lp-orb lp-orb-2" aria-hidden="true" />
      <div className="lp-orb lp-orb-3" aria-hidden="true" />

      {}
      <header className="lp-nav" role="banner">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon" aria-hidden="true">✦</div>
            <span className="lp-logo-text">ResumeIQ</span>
          </div>
          <nav className="lp-nav-right" aria-label="Site navigation">
            <a href="#how-it-works" className="lp-nav-link">How it works</a>
            <a href="#features" className="lp-nav-link">Features</a>
            <button
              id="lp-signin-btn"
              className="btn btn-outline lp-signin-btn"
              onClick={onAnalyze}
              type="button"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {}
      <section className="lp-hero" id="hero" aria-labelledby="lp-heading">
        <div className="lp-hero-inner">
          {}
          <div className="lp-hero-text">
            <div className="hero-tag" role="status">
              <span className="hero-tag-dot" aria-hidden="true" />
              Powered by Google Gemini 1.5 Flash
            </div>

            <h1 className="lp-headline" id="lp-heading">
              Your Resume Gets Rejected{' '}
              <span className="lp-headline-accent">Before Humans</span>{' '}
              See It.{' '}
              <span className="lp-headline-cta">Fix It Instantly.</span>
            </h1>

            <p className="lp-subtext">
              Analyze, optimize, and build ATS-friendly resumes with real-time feedback.
              Full score report in under 2 seconds — no signup, no data stored.
            </p>

            {}
            <div className="lp-trust-row" role="list" aria-label="Trust signals">
              <div className="lp-trust-item" role="listitem">
                <span aria-hidden="true">🔒</span> Privacy-first: No data stored
              </div>
              <div className="lp-trust-item" role="listitem">
                <span aria-hidden="true">⚡</span> Runs locally in your browser
              </div>
              <div className="lp-trust-item" role="listitem">
                <span aria-hidden="true">🤖</span> AI-enhanced by Gemini
              </div>
            </div>

            {}
            <div className="lp-cta-group">
              <button
                id="lp-analyze-btn"
                className="btn btn-primary btn-lg lp-cta-primary"
                onClick={onAnalyze}
                type="button"
                aria-label="Analyze my resume"
              >
                <span aria-hidden="true">🔍</span> Analyze My Resume
              </button>
              <button
                id="lp-build-btn"
                className="btn lp-cta-secondary"
                onClick={onBuild}
                type="button"
                aria-label="Build a new resume"
              >
                <span aria-hidden="true">✨</span> Build Resume
              </button>
            </div>
          </div>

          {}
          <div className="lp-hero-visual" aria-hidden="true">
            <div className="lp-visual-card">
              <div className="lp-visual-card-header">
                <span className="lp-visual-dot lp-dot-red" />
                <span className="lp-visual-dot lp-dot-amber" />
                <span className="lp-visual-dot lp-dot-green" />
                <span className="lp-visual-title">ATS Analysis Report</span>
              </div>
              <HeroScoreRing />
              <div className="lp-issue-chips">
                <div className="lp-issue-chip chip-red">⚠ Weak action verbs detected</div>
                <div className="lp-issue-chip chip-amber">⚡ 3 keywords missing</div>
                <div className="lp-issue-chip chip-green">✓ Format score 91/100</div>
              </div>
            </div>

            {}
            <div className="lp-float-badge lp-float-badge-tl">
              <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>+34</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>score boost</span>
            </div>
            <div className="lp-float-badge lp-float-badge-br">
              <span style={{ fontSize: '0.75rem' }}>🚀 Resume optimized</span>
            </div>
          </div>
        </div>
      </section>

      {}
      <div className="lp-stats-bar" role="list" aria-label="Platform statistics">
        {[
          { value: '6+',   label: 'Dimensions Scored' },
          { value: 'ATS',  label: '40/20/20/20 Formula' },
          { value: '0ms',  label: 'Network Requests' },
          { value: '30+',  label: 'Job Roles' },
        ].map(s => (
          <div key={s.label} className="lp-stat" role="listitem">
            <div className="lp-stat-value">{s.value}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {}
      <section className="lp-how-section" id="how-it-works" aria-labelledby="how-heading">
        <div className="lp-section-inner">
          <div className="lp-section-tag">How It Works</div>
          <h2 className="lp-section-title" id="how-heading">Four steps to a better resume</h2>
          <div className="lp-steps-grid" role="list">
            {STEPS.map((step, i) => (
              <div key={step.num} className="lp-step-card" role="listitem">
                <div className="lp-step-num">{step.num}</div>
                <div className="lp-step-title">{step.title}</div>
                <div className="lp-step-desc">{step.desc}</div>
                {i < STEPS.length - 1 && <div className="lp-step-arrow" aria-hidden="true">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="lp-features-section" id="features" aria-labelledby="features-heading">
        <div className="lp-section-inner">
          <div className="lp-section-tag">Features</div>
          <h2 className="lp-section-title" id="features-heading">Everything you need to land the interview</h2>
          <div className="lp-features-grid" role="list">
            {FEATURES.map(f => (
              <div key={f.title} className="lp-feature-card" role="listitem">
                <div className="lp-feature-icon" aria-hidden="true">{f.icon}</div>
                <div className="lp-feature-name">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="lp-final-cta" aria-labelledby="final-cta-heading">
        <div className="lp-final-inner">
          <h2 className="lp-final-title" id="final-cta-heading">Ready to fix your resume?</h2>
          <p className="lp-final-sub">Join candidates who optimized their resume with ResumeIQ — completely free.</p>
          <div className="lp-cta-group">
            <button
              id="lp-final-cta-btn"
              className="btn btn-primary btn-lg lp-cta-primary"
              onClick={onAnalyze}
              type="button"
            >
              <span aria-hidden="true">🚀</span> Get Started Free
            </button>
          </div>
          <p className="lp-final-note">No signup required · 100% free · Runs in your browser</p>
        </div>
      </section>

      {}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-logo">
            <div className="lp-logo-icon" aria-hidden="true">✦</div>
            <span className="lp-logo-text">ResumeIQ</span>
          </div>
          <p className="lp-footer-text">
            Built with <span style={{ color: 'var(--accent-purple-light)' }}>♥</span> · 100% private — no data ever leaves your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
