import { useEffect, useState } from 'react';

const STEPS = [
  'Reading resume file...',
  'Extracting text content...',
  'Matching skills against role keywords...',
  'Scoring experience quality...',
  'Evaluating projects and formatting...',
  'Generating improvement report...',
];

export default function AnalysisLoader({ currentStep }) {
  const [visibleStep, setVisibleStep] = useState(0);

  useEffect(() => {
    if (currentStep > visibleStep) {
      setVisibleStep(currentStep);
    }
  }, [currentStep]);

  return (
    <div className="loader-overlay" role="status" aria-live="polite" aria-label="Analyzing resume...">
      <div className="loader-content">
        <div className="loader-spinner" aria-hidden="true">
          <div className="loader-spinner-ring" />
          <div className="loader-spinner-ring" />
          <div className="loader-spinner-ring" />
        </div>

        <h2 className="loader-title">Analyzing Your Resume</h2>
        <p className="loader-subtitle">Running local ATS analysis engine...</p>

        <ul className="loader-steps" aria-label="Analysis progress">
          {STEPS.map((step, i) => {
            const isDone = i < visibleStep;
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
