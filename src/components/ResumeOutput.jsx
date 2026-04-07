import { useState } from 'react';
import { exportResumePDF } from '../utils/exportPDF';

function getGrade(score) {
  if (score >= 85) return { label: 'Excellent', color: '#10b981' };
  if (score >= 70) return { label: 'Good',      color: '#60a5fa' };
  if (score >= 50) return { label: 'Average',   color: '#f59e0b' };
  return                  { label: 'Needs Work', color: '#ef4444' };
}

const TEMPLATES = [
  { id: 'modern',  label: 'Modern',  desc: 'Purple accents, skill tags',  icon: '🟣' },
  { id: 'classic', label: 'Classic', desc: 'Traditional serif layout',    icon: '🏛️' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean & typographic',         icon: '⬜' },
];

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      className={`copy-btn ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      type="button"
      aria-label={copied ? 'Copied!' : `Copy ${label}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? '✅' : '📋'}
    </button>
  );
}

export default function ResumeOutput({ data, targetRole, onReset }) {
  const {
    resumeText,
    overall_score,
    skill_match_percentage = 0,
    section_scores = {},
    missing_keywords = [],
    improved_bullets = [],
    suggested_skills = [],
    summary = {},
  } = data;

  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [copied, setCopied] = useState(false);

  const overallGrade = getGrade(overall_score);

  const skillScore = section_scores.skills     || 0;
  const expScore   = section_scores.experience || 0;
  const projScore  = section_scores.projects   || 0;
  const fmtScore   = section_scores.formatting || 0;

  const skillOf40 = Math.round(skillScore * 0.40);
  const expOf20   = Math.round(expScore   * 0.20);
  const projOf20  = Math.round(projScore  * 0.20);
  const fmtOf20   = Math.round(fmtScore   * 0.20);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(resumeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `Resume_${targetRole.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nameLine    = resumeText.split('\n').find(l => l.trim()) || 'Resume';
  const contactLine = resumeText.split('\n').filter(l => l.trim())[1] || '';

  const handleExportPDF = () => {
    exportResumePDF(resumeText, nameLine.trim(), contactLine.trim(), selectedTemplate);
  };

  return (
    <div className="resume-output-root" id="resume-output">

      {/* Header */}
      <div className="resume-output-header">
        <div>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '4px' }}>
            Generated Resume + ATS Analysis
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🎯 Target Role: <strong style={{ color: 'var(--text-secondary)' }}>{targetRole}</strong>
          </p>
        </div>
        <div className="resume-output-actions no-print">
          <button className="btn btn-outline" onClick={handleCopyAll} type="button" id="copy-resume-btn">
            {copied ? '✅ Copied!' : '📋 Copy Text'}
          </button>
          <button className="btn btn-outline" onClick={handleDownloadTxt} type="button" id="download-resume-btn">
            ⬇️ Download .txt
          </button>
          <button className="btn btn-primary" onClick={onReset} type="button" id="rebuild-btn">
            🔄 Start Over
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="template-selector no-print" role="group" aria-label="Choose resume template">
        <div className="template-selector-label">
          <span>🎨</span> Choose Template for PDF Export
        </div>
        <div className="template-options">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              type="button"
              className={`template-option ${selectedTemplate === t.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(t.id)}
              aria-pressed={selectedTemplate === t.id}
            >
              <span className="template-icon">{t.icon}</span>
              <span className="template-name">{t.label}</span>
              <span className="template-desc">{t.desc}</span>
            </button>
          ))}
        </div>
        <button
          id="export-pdf-btn"
          className="btn btn-primary"
          onClick={handleExportPDF}
          type="button"
          style={{ marginTop: '12px', width: '100%' }}
        >
          🖨️ Export as PDF ({TEMPLATES.find(t => t.id === selectedTemplate)?.label} Template)
        </button>
      </div>

      <div className="resume-output-grid">
        {/* Resume preview — collapsible on mobile */}
        <div className="resume-output-col-left">
          <details className="resume-collapsible" open>
            <summary>📄 Generated Resume Preview</summary>
            <div className="panel" style={{ height: '100%' }}>
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'rgba(124,58,237,0.12)' }}>📄</div>
                <h3 className="panel-title">Generated Resume</h3>
                <CopyButton text={resumeText} label="resume" />
              </div>
              <pre className="resume-plaintext">{resumeText}</pre>
            </div>
          </details>
        </div>


        {/* SECTION 2 */}
        <div className="resume-output-col-right">

          {/* Score card */}
          <div className="ats-score-card">
            <div className="ats-score-header">
              <span className="ats-score-label">SECTION 2: ATS SCORE</span>
              <span className="score-hero-grade" style={{ background: `${overallGrade.color}18`, color: overallGrade.color }}>
                {overall_score >= 85 && '🎉 '}{overallGrade.label}
              </span>
            </div>
            <div className="ats-overall-row">
              <span className="ats-overall-num" style={{ color: overallGrade.color }}>{overall_score}</span>
              <span className="ats-overall-denom">/100</span>
            </div>
            <p className="ats-score-role">Overall ATS Score</p>

            <div className="ats-breakdown">
              <div className="ats-breakdown-title">Breakdown:</div>
              {[
                { label: 'Skills Match',       score: skillOf40, max: 40, color: '#7c3aed' },
                { label: 'Experience Quality', score: expOf20,   max: 20, color: '#2563eb' },
                { label: 'Projects',           score: projOf20,  max: 20, color: '#06b6d4' },
                { label: 'Formatting',         score: fmtOf20,   max: 20, color: '#10b981' },
              ].map(row => (
                <div key={row.label} className="ats-breakdown-row">
                  <span className="ats-breakdown-label">- {row.label}</span>
                  <span className="ats-breakdown-score" style={{ color: row.color }}>{row.score}/{row.max}</span>
                  <div className="ats-breakdown-bar-track">
                    <div className="ats-breakdown-bar-fill" style={{ width: `${(row.score / row.max) * 100}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="ats-skill-match-row">
              <span>Skill Match</span>
              <span style={{ color: skill_match_percentage >= 60 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                {Math.round(skill_match_percentage)}%
              </span>
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>❌</div>
              <h3 className="panel-title">Missing Keywords</h3>
              <span className="panel-count">{missing_keywords.length}</span>
            </div>
            <div className="keywords-grid">
              {missing_keywords.slice(0, 12).map((kw, i) => (
                <span key={i} className="keyword-chip keyword-missing">{kw}</span>
              ))}
              {missing_keywords.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>🎉 All major keywords present!</p>
              )}
            </div>
          </div>

          {/* Bullet Fixes with per-bullet copy */}
          {improved_bullets.length > 0 && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>✍️</div>
                <h3 className="panel-title">Weak Bullet Fixes</h3>
              </div>
              {improved_bullets.map((b, i) => (
                <div key={i} className="bullet-card" style={{ marginBottom: '12px' }}>
                  <div className="bullet-before">
                    <div className="bullet-label bullet-label-before" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Original</span>
                    </div>
                    {b.original}
                  </div>
                  <div className="bullet-after">
                    <div className="bullet-label bullet-label-after" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Improved</span>
                      <CopyButton text={b.improved} label="improved bullet" />
                    </div>
                    {b.improved}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-icon" style={{ background: 'rgba(96,165,250,0.12)' }}>💡</div>
              <h3 className="panel-title">Final Suggestions</h3>
            </div>
            {summary.improvements?.map((tip, i) => (
              <div key={i} className="summary-item" style={{ marginBottom: '10px' }}>
                <span className="summary-item-num">{i + 1}</span>
                <span style={{ fontSize: '0.87rem' }}>{tip}</span>
              </div>
            ))}
            {suggested_skills.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>SKILLS TO ADD:</p>
                <div className="keywords-grid">
                  {suggested_skills.slice(0, 8).map((s, i) => (
                    <span key={i} className="keyword-chip keyword-suggested">+ {s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Strengths */}
          {summary.strengths?.length > 0 && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>✅</div>
                <h3 className="panel-title">Strengths</h3>
              </div>
              {summary.strengths.map((s, i) => (
                <div key={i} className="summary-item" style={{ marginBottom: '10px' }}>
                  <span className="summary-item-num">{i + 1}</span>
                  <span style={{ fontSize: '0.87rem' }}>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
