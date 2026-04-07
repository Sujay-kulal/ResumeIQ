import { useState } from 'react';

/* ── Copy button ─────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      className={`copy-btn ${copied ? 'copied' : ''}`}
      onClick={handle} type="button"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied' : 'Copy bullet'}
    >
      {copied ? '✅' : '📋'}
    </button>
  );
}

/* ── Tab system ─────────────────────────────────────────── */
function Tabs({ tabs, children }) {
  const [active, setActive] = useState(0);
  return (
    <div className="tabs-root">
      <div className="tabs-bar" role="tablist" aria-label="Analysis sections">
        {tabs.map((tab, i) => (
          <button
            key={tab.id} role="tab"
            id={`tab-${tab.id}`} aria-controls={`tabpanel-${tab.id}`}
            aria-selected={i === active}
            className={`tab-btn ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)} type="button"
          >
            {tab.icon} {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>
      {children.map((child, i) => (
        <div
          key={i} role="tabpanel"
          id={`tabpanel-${tabs[i].id}`} aria-labelledby={`tab-${tabs[i].id}`}
          className="tab-panel"
          hidden={i !== active}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

const FEEDBACK_META = {
  skills:     { icon: '⚡', label: 'Skills',     color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  experience: { icon: '💼', label: 'Experience', color: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
  projects:   { icon: '🚀', label: 'Projects',   color: '#06b6d4', bg: 'rgba(6,182,212,0.08)'  },
  formatting: { icon: '✨', label: 'Formatting', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
};

export default function AnalysisPanels({ data }) {
  const {
    missing_keywords  = [],
    weak_points       = [],
    improved_bullets  = [],
    suggested_skills  = [],
    matched_keywords  = [],
    section_feedback  = {},
    summary           = { strengths: [], improvements: [] },
    keyword_density   = {},
  } = data;

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview',   count: 0 },
    { id: 'skills',   icon: '⚡', label: 'Skills',     count: missing_keywords.length },
    { id: 'fixes',    icon: '✍️', label: 'Fixes',      count: improved_bullets.length },
  ];

  return (
    <Tabs tabs={tabs}>
      {/* ── Tab 1: Overview ── */}
      <div>
        {/* Section feedback cards */}
        {Object.keys(section_feedback).length > 0 && (
          <div className="section-feedback-grid" style={{ marginBottom: 24 }}>
            {Object.entries(FEEDBACK_META).map(([key, meta]) => {
              const text = section_feedback[key];
              if (!text) return null;
              return (
                <div key={key} className="section-feedback-card"
                  style={{ borderColor: `${meta.color}30`, background: meta.bg }}
                >
                  <div className="section-feedback-header">
                    <span className="section-feedback-icon" style={{ background: `${meta.color}20` }}>{meta.icon}</span>
                    <span className="section-feedback-label" style={{ color: meta.color }}>{meta.label}</span>
                  </div>
                  <p className="section-feedback-text">{text}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'rgba(124,58,237,0.12)' }}>📊</div>
            <h3 className="panel-title">Analysis Summary</h3>
          </div>
          <div className="summary-grid">
            <div className="summary-half strengths">
              <div className="summary-half-title"><span>✅</span> Strengths</div>
              {summary.strengths?.map((s, i) => (
                <div key={i} className="summary-item">
                  <span className="summary-item-num">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
              {!summary.strengths?.length && <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>No strengths identified.</p>}
            </div>
            <div className="summary-half improvements">
              <div className="summary-half-title"><span>🔧</span> Critical Improvements</div>
              {summary.improvements?.map((imp, i) => (
                <div key={i} className="summary-item">
                  <span className="summary-item-num">{i + 1}</span>
                  <span>{imp}</span>
                </div>
              ))}
              {!summary.improvements?.length && <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>No critical improvements needed.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab 2: Skills ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Matched */}
        {matched_keywords.length > 0 && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>✅</div>
              <h3 className="panel-title">Matched Keywords</h3>
              <span className="panel-count">{matched_keywords.length} found</span>
            </div>
            <div className="keywords-grid">
              {matched_keywords.map((kw, i) => {
                const count = keyword_density[kw.toLowerCase()] || 1;
                return (
                  <span key={i} className="keyword-chip keyword-matched keyword-density-chip"
                    title={`Appears ~${count}x in resume`}
                  >
                    {kw}
                    <span className="density-badge" style={{ background: count >= 3 ? '#10b981' : count >= 2 ? '#2563eb' : '#64748b' }}>
                      {count}×
                    </span>
                  </span>
                );
              })}
            </div>
            <p className="field-hint" style={{ marginTop: 10 }}>Each badge = keyword frequency. Aim for 2–3× per key skill.</p>
          </div>
        )}

        {/* Missing */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>🔍</div>
            <h3 className="panel-title">Missing Keywords</h3>
            <span className="panel-count">{missing_keywords.length} missing</span>
          </div>
          <div className="keywords-grid">
            {missing_keywords.map((kw, i) => (
              <span key={i} className="keyword-chip keyword-missing">{kw}</span>
            ))}
            {missing_keywords.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>🎉 No critical keywords missing!</p>
            )}
          </div>
        </div>

        {/* Suggested */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>💡</div>
            <h3 className="panel-title">Skills to Add</h3>
            <span className="panel-count">{suggested_skills.length} suggestions</span>
          </div>
          <div className="keywords-grid">
            {suggested_skills.map((skill, i) => (
              <span key={i} className="keyword-chip keyword-suggested">+ {skill}</span>
            ))}
            {suggested_skills.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>Skills section looks comprehensive.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab 3: Fixes ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Weak points */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>⚠️</div>
            <h3 className="panel-title">Weak Bullet Points</h3>
            <span className="panel-count">{weak_points.length} found</span>
          </div>
          {weak_points.map((point, i) => (
            <div key={i} className="weak-point-item">{point}</div>
          ))}
          {weak_points.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>Strong bullets — no vague language detected.</p>
          )}
        </div>

        {/* AI rewrites */}
        {improved_bullets.length > 0 && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-icon" style={{ background: 'rgba(96,165,250,0.12)' }}>✍️</div>
              <h3 className="panel-title">AI-Rewritten Bullets</h3>
              <span className="panel-count">{improved_bullets.length} rewrites</span>
              <span className="panel-formula-badge">Action Verb + Task + Tech + Result</span>
            </div>
            {improved_bullets.map((bullet, i) => (
              <div key={i} className="bullet-card">
                <div className="bullet-before">
                  <div className="bullet-label bullet-label-before">❌ Before — Vague</div>
                  {bullet.original}
                </div>
                <div className="bullet-after">
                  <div className="bullet-label bullet-label-after" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✅ After — Improved</span>
                    <CopyButton text={bullet.improved} />
                  </div>
                  {bullet.improved}
                </div>
              </div>
            ))}
          </div>
        )}

        {improved_bullets.length === 0 && weak_points.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
            <p style={{ color: 'var(--text-secondary)' }}>No bullet fixes needed — your content is strong!</p>
          </div>
        )}
      </div>
    </Tabs>
  );
}
