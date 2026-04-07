import { useState } from 'react';

const STEPS = [
  'Reading your resume file...',
  'Extracting text and structure...',
  'Matching skills against role keywords...',
  'Scoring experience and impact...',
  'Evaluating projects and formatting...',
  'Compiling full ATS report...',
];

export default function AnalysisLoader({ currentStep }) {
  const [maxStep, setMaxStep] = useState(0);

  if (currentStep > maxStep) {
    setMaxStep(currentStep);
  }

  const visibleStep = maxStep;

  const pct = Math.round((visibleStep / STEPS.length) * 100);

  return (
    <div className="loader-overlay" role="status" aria-live="polite" aria-label="Analyzing resume...">
      <div className="loader-content">
        {/* Logo */}
        <div className="loader-logo">
          <div className="loader-logo-icon" aria-hidden="true">✦</div>
          <span className="loader-logo-text">ResumeIQ</span>
        </div>

        {/* Spinner */}
        <div className="loader-spinner" aria-hidden="true">
          <div className="loader-spinner-ring" />
          <div className="loader-spinner-ring" />
          <div className="loader-spinner-ring" />
        </div>

        <h2 className="loader-title">Analyzing Your Resume</h2>
        <p className="loader-subtitle">Running local ATS analysis engine...</p>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: 4, background: 'rgba(255,255,255,0.06)',
          borderRadius: 2, overflow: 'hidden', margin: '0 0 20px'
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #7c3aed, #2563eb)',
            width: `${pct}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        <ul className="loader-steps" aria-label="Analysis progress">
          {STEPS.map((step, i) => {
            const isDone   = i < visibleStep;
            const isActive = i === visibleStep;
            return (
              <li
                key={i}
                className={`loader-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="loader-step-dot" aria-hidden="true" />
                {isDone ? '✓ ' : ''}{step}
              </li>
            );
          })}
        </ul>

        <p style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔒 100% local — no data leaves your browser
        </p>
      </div>
    </div>
  );
}
