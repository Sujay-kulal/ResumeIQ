import { useEffect, useRef, useState } from 'react';
import { ROLE_OPTIONS } from '../utils/analyzeResume';
import { correctInput } from '../utils/correctInput';

// Fields that support real-time correction
const CORRECTABLE_FIELDS = ['summary', 'experience', 'projects'];

const FIELDS = [
  { key: 'name',         label: 'Full Name',              icon: '👤', type: 'input',    placeholder: 'e.g., Sujay Mehta',                                      hint: 'Your full name as it should appear on the resume.' },
  { key: 'contact',      label: 'Contact Info',            icon: '📬', type: 'input',    placeholder: 'email | phone | linkedin.com/in/you | github.com/you',   hint: 'Separate with | or commas.' },
  { key: 'summary',      label: 'Professional Summary',   icon: '📝', type: 'textarea', placeholder: 'Software engineer with 3+ years building scalable web apps...', hint: 'Keep it concise and role-specific.' },
  { key: 'skills',       label: 'Skills',                  icon: '⚡', type: 'textarea', placeholder: 'Python, React, Docker, AWS, PostgreSQL, Git...',         hint: 'Comma-separated. Include languages, frameworks, tools, platforms.' },
  { key: 'experience',   label: 'Experience',              icon: '💼', type: 'textarea', placeholder: 'Software Engineer | Acme Corp | Jan 2022 - Present\nBuilt REST API using Node.js...\n\nIntern | XYZ Ltd | Jun 2021 - Dec 2021\nWorked on Python data pipelines...', hint: 'One block per role (blank line between). Use ✨ Fix to auto-improve bullets.' },
  { key: 'projects',     label: 'Projects',                icon: '🚀', type: 'textarea', placeholder: 'ResumeIQ - AI Resume Analyzer\nBuilt React app parsing PDFs locally\nReduced load time by 40%\n\nPortfolio Site\nDesigned using HTML/CSS/JavaScript', hint: 'One block per project. Use ✨ Fix to strengthen descriptions.' },
  { key: 'education',    label: 'Education',               icon: '🎓', type: 'textarea', placeholder: 'B.Tech Computer Science | XYZ University | 2020-2024\nCGPA: 8.5/10', hint: 'Degree, institution, year, GPA.' },
  { key: 'achievements', label: 'Achievements (Optional)', icon: '🏆', type: 'textarea', placeholder: 'Winner - HackXYZ National Hackathon 2023\nTop 5% on LeetCode', hint: 'Awards, competitions, rankings - optional.' },
];

const SECTIONS = [
  { title: 'Basic Info',  fields: ['name', 'contact', 'summary'] },
  { title: 'Skills',      fields: ['skills'] },
  { title: 'Experience',  fields: ['experience'] },
  { title: 'Projects',    fields: ['projects'] },
  { title: 'Education',   fields: ['education', 'achievements'] },
];

const REQUIRED = ['name', 'contact', 'skills', 'experience', 'education'];
const SESSION_KEY = 'resumeiq_builder_form';
const EMPTY = Object.fromEntries([...FIELDS.map(f => [f.key, '']), ['targetRole', 'Software Engineer (General)']]);

// ─── Correctable Textarea (with Fix button) ──────────────────
function CorrectableTextarea({ id, fieldKey, value, onChange, rows, placeholder, hasError }) {
  const [fixState, setFixState] = useState('idle'); // idle | fixed | no_change
  const [changes, setChanges] = useState([]);
  const [showDiff, setShowDiff] = useState(false);
  const timerRef = useRef(null);

  const fieldType = fieldKey === 'summary' ? 'summary' : 'experience';

  const handleFix = () => {
    if (!value.trim()) return;
    const result = correctInput(value, fieldType);
    if (result.changed) {
      onChange(result.corrected);
      setChanges(result.changes);
      setFixState('fixed');
      setShowDiff(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowDiff(false);
        setFixState('idle');
      }, 4000);
    } else {
      setFixState('no_change');
      setChanges([]);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setFixState('idle'), 2000);
    }
  };

  const hasContent = value.trim().length > 10;

  return (
    <div className="correctable-field-wrap">
      <div className="correctable-textarea-row">
        <textarea
          id={id}
          className={`builder-textarea ${hasError ? 'input-error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={e => { onChange(e.target.value); setFixState('idle'); setShowDiff(false); }}
          rows={rows}
        />
        {hasContent && (
          <button
            type="button"
            className={`fix-btn ${fixState}`}
            onClick={handleFix}
            title="Auto-fix grammar and weak phrases"
            aria-label="Auto-fix this field"
          >
            {fixState === 'fixed'    ? '✅ Fixed!'    :
             fixState === 'no_change' ? '👍 Looks good' :
             '✨ Fix'}
          </button>
        )}
      </div>

      {showDiff && changes.length > 0 && (
        <div className="fix-diff-banner" role="status" aria-live="polite">
          <span className="fix-diff-icon">✅</span>
          <div className="fix-diff-list">
            <strong>{changes.length} improvement{changes.length > 1 ? 's' : ''} applied:</strong>
            {changes.map((c, i) => <div key={i} className="fix-diff-item">{c}</div>)}
          </div>
          <button
            type="button"
            className="fix-diff-close"
            onClick={() => setShowDiff(false)}
            aria-label="Close"
          >✕</button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function ResumeBuilder({ onGenerate, isLoading }) {
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? { ...EMPTY, ...JSON.parse(saved) } : EMPTY;
    } catch { return EMPTY; }
  });
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(form));
  }, [form]);

  const currentFields = SECTIONS[currentSection].fields;

  const handleChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = (fieldKeys) => {
    const newErrors = {};
    fieldKeys.forEach(key => {
      if (REQUIRED.includes(key) && !form[key].trim()) newErrors[key] = 'This field is required.';
    });
    setErrors(e => ({ ...e, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate(currentFields)) return;
    setCurrentSection(s => Math.min(s + 1, SECTIONS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => setCurrentSection(s => Math.max(s - 1, 0));

  const handleGenerate = () => {
    const allRequired = FIELDS.filter(f => REQUIRED.includes(f.key)).map(f => f.key);
    const newErrors = {};
    allRequired.forEach(key => { if (!form[key].trim()) newErrors[key] = 'This field is required.'; });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = Object.keys(newErrors)[0];
      const sIdx = SECTIONS.findIndex(s => s.fields.includes(firstKey));
      if (sIdx >= 0) setCurrentSection(sIdx);
      return;
    }
    sessionStorage.removeItem(SESSION_KEY);
    onGenerate(form);
  };

  const handleClear = () => {
    if (window.confirm('Clear all form data?')) {
      setForm(EMPTY); setErrors({}); setCurrentSection(0);
      sessionStorage.removeItem(SESSION_KEY);
    }
  };

  const isLast = currentSection === SECTIONS.length - 1;
  const hasSavedData = Object.values(form).some(v => v && v !== 'Software Engineer (General)' && v.trim());

  return (
    <section className="builder-section" aria-labelledby="builder-heading" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="builder-split-layout">
        <div className="builder-form-panel">
          <h2 className="section-title" id="builder-heading">Resume Builder</h2>
          <p className="section-subtitle">
            Enter your details — the engine generates an ATS-optimized resume + scores it instantly
          </p>

        {hasSavedData && (
          <div className="session-banner" role="status">
            <span>💾 Form data restored from your last session</span>
            <button className="session-clear-btn" onClick={handleClear} type="button">Clear all</button>
          </div>
        )}

        <div className="builder-role-row">
          <label htmlFor="builder-role" className="form-label">
            <span aria-hidden="true">🎯</span> Target Job Role
          </label>
          <select
            id="builder-role"
            className="form-select builder-role-select"
            value={form.targetRole}
            onChange={e => handleChange('targetRole', e.target.value)}
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="builder-progress" role="navigation">
          {SECTIONS.map((sec, i) => (
            <div
              key={sec.title}
              className={`builder-step ${i === currentSection ? 'active' : ''} ${i < currentSection ? 'done' : ''}`}
              onClick={() => i < currentSection && setCurrentSection(i)}
              role="button"
              tabIndex={i < currentSection ? 0 : -1}
              aria-current={i === currentSection ? 'step' : undefined}
            >
              <div className="builder-step-circle">{i < currentSection ? '✓' : i + 1}</div>
              <span className="builder-step-label">{sec.title}</span>
            </div>
          ))}
        </div>

        <div className="builder-form-card">
          <div className="builder-form-section-title">{SECTIONS[currentSection].title}</div>

          {currentFields.map(key => {
            const field = FIELDS.find(f => f.key === key);
            if (!field) return null;
            const isCorrectable = CORRECTABLE_FIELDS.includes(key);

            return (
              <div className="form-field builder-field" key={key}>
                <div className="builder-label-row">
                  <label htmlFor={`field-${key}`} className="form-label builder-label">
                    <span aria-hidden="true">{field.icon}</span> {field.label}
                  </label>
                  {isCorrectable && (
                    <span className="fix-hint-badge">✨ Auto-fix available</span>
                  )}
                </div>

                {field.type === 'input' ? (
                  <input
                    id={`field-${key}`}
                    type="text"
                    className={`form-input ${errors[key] ? 'input-error' : ''}`}
                    placeholder={field.placeholder}
                    value={form[key]}
                    onChange={e => handleChange(key, e.target.value)}
                  />
                ) : isCorrectable ? (
                  <CorrectableTextarea
                    id={`field-${key}`}
                    fieldKey={key}
                    value={form[key]}
                    onChange={val => handleChange(key, val)}
                    rows={key === 'experience' ? 10 : key === 'projects' ? 8 : 5}
                    placeholder={field.placeholder}
                    hasError={!!errors[key]}
                  />
                ) : (
                  <textarea
                    id={`field-${key}`}
                    className={`builder-textarea ${errors[key] ? 'input-error' : ''}`}
                    placeholder={field.placeholder}
                    value={form[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    rows={key === 'achievements' ? 4 : 5}
                  />
                )}

                {errors[key]
                  ? <p role="alert" className="field-error">{errors[key]}</p>
                  : <p className="field-hint">{field.hint}</p>
                }
              </div>
            );
          })}

          <div className="builder-nav-row">
            {currentSection > 0 && (
              <button className="btn btn-outline" onClick={handleBack} type="button">← Back</button>
            )}
            <button
              className="btn btn-outline"
              onClick={handleClear}
              type="button"
              style={{ marginLeft: currentSection === 0 ? 'auto' : '0' }}
            >
              🗑 Clear
            </button>
            {!isLast ? (
              <button className="btn btn-primary" onClick={handleNext} type="button" style={{ marginLeft: 'auto' }}>
                Next →
              </button>
            ) : (
              <button
                id="generate-resume-btn"
                className="btn btn-primary btn-lg"
                onClick={handleGenerate}
                disabled={isLoading}
                type="button"
                style={{ marginLeft: 'auto' }}
              >
                {isLoading
                  ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Generating...</>
                  : <><span>✨</span> Generate + Analyze Resume</>
                }
              </button>
            )}
          </div>
        </div>

        {/* ── LIVE PREVIEW PANEL ── */}
        <div className="builder-preview-panel">
          <div className="preview-sticky">
            <div className="preview-header">
              <h3>Live Preview</h3>
              <span className="live-badge">Live</span>
            </div>
            
            <div className="preview-document">
              <div className="preview-doc-header">
                <h1 className="preview-name">{form.name || 'Your Name'}</h1>
                <p className="preview-contact">{form.contact || 'Contact Information'}</p>
              </div>

              {form.summary && (
                <div className="preview-section">
                  <h4 className="preview-section-title">Professional Summary</h4>
                  <p className="preview-text">{form.summary}</p>
                </div>
              )}

              {form.experience && (
                <div className="preview-section">
                  <h4 className="preview-section-title">Experience</h4>
                  <pre className="preview-pre">{form.experience}</pre>
                </div>
              )}

              {form.projects && (
                <div className="preview-section">
                  <h4 className="preview-section-title">Projects</h4>
                  <pre className="preview-pre">{form.projects}</pre>
                </div>
              )}

              {form.skills && (
                <div className="preview-section">
                  <h4 className="preview-section-title">Skills</h4>
                  <p className="preview-text">{form.skills}</p>
                </div>
              )}

              {form.education && (
                <div className="preview-section">
                  <h4 className="preview-section-title">Education</h4>
                  <pre className="preview-pre">{form.education}</pre>
                </div>
              )}

              {form.achievements && (
                <div className="preview-section">
                  <h4 className="preview-section-title">Achievements</h4>
                  <pre className="preview-pre">{form.achievements}</pre>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
