import { useEffect, useRef, useState } from 'react';

function getScoreGrade(score) {
  if (score >= 85) return { label: 'Excellent', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', cls: 'score-excellent' };
  if (score >= 70) return { label: 'Good',      color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', cls: 'score-good'      };
  if (score >= 40) return { label: 'Average',   color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', cls: 'score-average'  };
  return                  { label: 'Needs Work', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', cls: 'score-poor'     };
}

function getBarClass(score) {
  if (score >= 85) return 'bar-excellent';
  if (score >= 70) return 'bar-good';
  if (score >= 40) return 'bar-average';
  return 'bar-poor';
}

/** Returns the gradient IDs and colors based on score tier */
function getRingGradient(score) {
  if (score >= 70) return { id: 'ring-green', c1: '#10b981', c2: '#34d399', tier: 'tier-green' };
  if (score >= 40) return { id: 'ring-amber', c1: '#f59e0b', c2: '#fbbf24', tier: 'tier-amber' };
  return                  { id: 'ring-red',   c1: '#ef4444', c2: '#f87171', tier: 'tier-red'   };
}

const SECTION_META = {
  skills:     { label: 'Skills',        icon: '⚡', color: '#7c3aed', weight: '40%' },
  experience: { label: 'Experience',    icon: '💼', color: '#2563eb', weight: '20%' },
  projects:   { label: 'Projects',      icon: '🚀', color: '#06b6d4', weight: '20%' },
  education:  { label: 'Education',     icon: '🎓', color: '#10b981', weight: null  },
  ats:        { label: 'ATS Composite', icon: '🤖', color: '#f59e0b', weight: null  },
  formatting: { label: 'Formatting',    icon: '✨', color: '#a855f7', weight: '20%' },
};

/** Animated counter + color-coded ring */
function ScoreRing({ score }) {
  const circumference = 502;
  const fillRef = useRef(null);
  const [displayed, setDisplayed] = useState(0);
  const grad = getRingGradient(score);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    if (fillRef.current) {
      const offset = circumference - (score / 100) * circumference;
      requestAnimationFrame(() => { if (fillRef.current) fillRef.current.style.strokeDashoffset = offset; });
    }
  }, [score]);

  const grade = getScoreGrade(score);

  return (
    <div className="score-ring-container score-ring-lg" role="img" aria-label={`Overall ATS score: ${score}/100`}>
      <svg className="score-ring-svg" viewBox="0 0 180 180" aria-hidden="true">
        <defs>
          <linearGradient id={grad.id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.c1} />
            <stop offset="100%" stopColor={grad.c2} />
          </linearGradient>
          {/* Keep purple gradient as well for compatibility */}
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <circle className="score-ring-bg" cx="90" cy="90" r="80" />
        <circle
          ref={fillRef}
          className={`score-ring-fill ${grad.tier}`}
          cx="90" cy="90" r="80"
          stroke={`url(#${grad.id})`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 8px ${grad.c1}66)`,
          }}
        />
      </svg>
      <div className="score-ring-center">
        <div className="score-ring-value" style={{ color: grade.color }}>{displayed}</div>
        <div className="score-ring-label">ATS Score</div>
      </div>
    </div>
  );
}

/** Skill match donut */
function SkillMatchGauge({ pct = 0, matchedCount = 0, totalCount = 0 }) {
  const circumference = 282;
  const fillRef = useRef(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * pct));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    if (fillRef.current) {
      const offset = circumference - (pct / 100) * circumference;
      requestAnimationFrame(() => { if (fillRef.current) fillRef.current.style.strokeDashoffset = offset; });
    }
  }, [pct]);

  const grade = getScoreGrade(pct);

  return (
    <div className="skill-match-gauge" role="img" aria-label={`Skill match: ${pct}%`}>
      <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grade.color} />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
        <circle
          ref={fillRef}
          cx="55" cy="55" r="45"
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth="9"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
            transformOrigin: '55px 55px',
            transform: 'rotate(-90deg)',
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        <text x="55" y="50" textAnchor="middle" fill={grade.color} fontSize="16" fontWeight="800" fontFamily="Space Grotesk, sans-serif">
          {displayed}%
        </text>
        <text x="55" y="66" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="Inter, sans-serif">
          MATCH
        </text>
      </svg>
      <div className="skill-match-meta">
        <div className="skill-match-counts">
          <span style={{ color: '#10b981' }}>✓ {matchedCount} matched</span>
          <span style={{ color: '#ef4444' }}>✗ {totalCount - matchedCount} missing</span>
        </div>
      </div>
    </div>
  );
}

function SectionScoreCard({ sectionKey, score, delay }) {
  const meta = SECTION_META[sectionKey];
  const barRef = useRef(null);
  const grade = getScoreGrade(score);

  useEffect(() => {
    const t = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = `${score}%`;
    }, delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div className="score-card" role="article" aria-label={`${meta.label}: ${score}/100`}>
      <div className="score-card-header">
        <div className="score-card-label">
          <div className="score-card-icon" style={{ background: `${meta.color}20` }} aria-hidden="true">
            {meta.icon}
          </div>
          <span>{meta.label}</span>
          {meta.weight && (
            <span className="score-weight-badge">{meta.weight}</span>
          )}
        </div>
        <div className={`score-card-value ${grade.cls}`}>{score}</div>
      </div>
      <div className="score-bar-track" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <div
          ref={barRef}
          className={`score-bar-fill ${getBarClass(score)}`}
          style={{ width: 0, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  );
}

export default function ScoreDashboard({ data, targetRole, onSwitchMode, onFixIt }) {
  const {
    overall_score,
    section_scores,
    skill_match_percentage = 0,
    matched_keywords = [],
    missing_keywords = [],
  } = data;

  const grade         = getScoreGrade(overall_score);
  const totalKeywords = matched_keywords.length + missing_keywords.length;

  const getDescription = (score) => {
    if (score >= 85) return 'Highly competitive — well-optimized for ATS systems. Tailor keywords for each specific job listing.';
    if (score >= 70) return 'Solid foundation with good fundamentals. A few targeted improvements can significantly boost callback rates.';
    if (score >= 40) return 'Has potential but several key areas need attention. Follow the recommendations below.';
    return 'Needs significant improvements. Implement suggestions below to increase ATS pass-through rates.';
  };

  const scrollToFixes = () => {
    document.getElementById('tabpanel-fixes')?.closest('.tabs-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Click the fixes tab
    document.getElementById('tab-fixes')?.click();
  };

  const scrollToSkills = () => {
    document.getElementById('tabpanel-skills')?.closest('.tabs-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('tab-skills')?.click();
  };

  return (
    <div className="results-3col">
      {/* ── LEFT: Score Ring + Action Panel ── */}
      <div className="results-3col-left">
        <div className="score-hero-card" style={{ flexDirection: 'column', gap: 20, padding: '28px 20px', alignItems: 'center', textAlign: 'center' }}>
          <ScoreRing score={overall_score} />

          {/* Grade badge */}
          <div
            className="score-hero-grade"
            style={{ background: grade.bg, color: grade.color }}
            role="status"
          >
            {grade.label}
          </div>

          {/* Skill match */}
          <div className="skill-match-section">
            <SkillMatchGauge
              pct={Math.round(skill_match_percentage)}
              matchedCount={matched_keywords.length}
              totalCount={totalKeywords || 20}
            />
            <div className="skill-match-label">
              <div className="skill-match-title">Skill Match</div>
              <div className="skill-match-role" aria-label={`Target role: ${targetRole}`}>
                🎯 {targetRole}
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION PANEL ── */}
        <div className="action-panel">
          <div className="action-panel-title">Quick Actions</div>
          <div className="action-panel-btns">
            <button
              className="action-btn action-btn-primary"
              onClick={onFixIt || scrollToFixes}
              type="button"
              aria-label="Interactive Fix Items Wizard"
            >
              <div className="action-btn-icon">✍️</div>
              <div>
                <div>Fix My Bullets</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: 1 }}>View AI-rewritten bullets</div>
              </div>
            </button>

            <button
              className="action-btn action-btn-secondary"
              onClick={scrollToSkills}
              type="button"
              aria-label="Jump to skills gap"
            >
              <div className="action-btn-icon">⚡</div>
              <div>
                <div>View Skills Gap</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 1 }}>{missing_keywords.length} keywords missing</div>
              </div>
            </button>

            {onSwitchMode && (
              <button
                className="action-btn action-btn-secondary"
                onClick={() => onSwitchMode('build')}
                type="button"
                aria-label="Switch to resume builder"
              >
                <div className="action-btn-icon">🚀</div>
                <div>
                  <div>Generate New Resume</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 1 }}>Use the resume builder</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Info + Section Scores ── */}
      <div>
        {/* Score summary card */}
        <div className="score-hero-card" style={{ marginBottom: 24 }}>
          <div className="score-hero-info" style={{ flex: 1 }}>
            <h3 className="score-hero-title">ATS Analysis Report</h3>
            <p className="score-hero-desc">{getDescription(overall_score)}</p>

            {/* Weight formula */}
            <div className="score-formula" aria-label="Scoring formula">
              <span className="formula-piece" style={{ color: '#7c3aed' }}>Skills×40%</span>
              <span className="formula-op">+</span>
              <span className="formula-piece" style={{ color: '#2563eb' }}>Exp×20%</span>
              <span className="formula-op">+</span>
              <span className="formula-piece" style={{ color: '#06b6d4' }}>Projects×20%</span>
              <span className="formula-op">+</span>
              <span className="formula-piece" style={{ color: '#10b981' }}>Format×20%</span>
            </div>
          </div>
        </div>

        {/* Section Scores Grid */}
        <div className="section-scores-grid" role="list" aria-label="Section scores">
          {Object.entries(section_scores).map(([key, score], i) => (
            <div key={key} role="listitem">
              <SectionScoreCard sectionKey={key} score={score} delay={200 + i * 100} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
