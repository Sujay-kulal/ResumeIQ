import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatFileSize } from '../utils/extractText';
import { ROLE_OPTIONS } from '../utils/analyzeResume';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
};

const SESSION_KEY = 'resumeiq_uploader_role';

export default function ResumeUploader({
  file, onFileChange,
  targetRole, onTargetRoleChange,
  onAnalyze, isLoading,
}) {
  const [fileError, setFileError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [useCustomRole, setUseCustomRole] = useState(false);

  // Restore role from session
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved && ROLE_OPTIONS.includes(saved)) {
      onTargetRoleChange(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = useCallback((accepted, rejected) => {
    setFileError('');
    if (rejected.length > 0) {
      setFileError('Unsupported file type. Please upload PDF, DOCX, DOC, or TXT.');
      return;
    }
    if (accepted.length > 0) onFileChange(accepted[0]);
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED_TYPES, maxFiles: 1, maxSize: 10 * 1024 * 1024,
  });

  const getFileIcon = (f) => {
    if (!f) return '📄';
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'docx' || ext === 'doc') return '📘';
    return '📄';
  };

  const activeRole = useCustomRole ? customRole : targetRole;

  const handleAnalyze = () => {
    let valid = true;
    if (!file) { setFileError('Please upload a resume file first.'); valid = false; } else setFileError('');
    if (!activeRole.trim()) { setRoleError('Please select or enter a target job role.'); valid = false; } else setRoleError('');
    if (valid) onAnalyze(activeRole.trim());
  };

  const handleRoleSelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setUseCustomRole(true);
      onTargetRoleChange('');
    } else {
      setUseCustomRole(false);
      onTargetRoleChange(val);
      setRoleError('');
      sessionStorage.setItem(SESSION_KEY, val);
    }
  };

  return (
    <section className="upload-section" id="upload" aria-labelledby="upload-heading">
      <div className="container">
        <h2 className="section-title" id="upload-heading">Analyze Your Resume</h2>
        <p className="section-subtitle">
          Upload your resume and pick a target role — analysis runs instantly in your browser
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div className="local-badge" aria-label="Local analysis — no API key needed">
            <span aria-hidden="true">🔒</span>
            100% Local Analysis — No API Key Required · No Data Leaves Your Browser
          </div>
        </div>

        <div className="upload-form-grid">
          <div className="upload-form-left">
            <div className="form-field">
              <label htmlFor="role-select" className="form-label">
                <span aria-hidden="true">🎯</span> Target Job Role
              </label>
              <select
                id="role-select"
                className="form-select"
                value={useCustomRole ? '__custom__' : targetRole}
                onChange={handleRoleSelect}
              >
                <option value="" disabled>Select a role...</option>
                {ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                <option value="__custom__">✏️ Enter custom role...</option>
              </select>
              {useCustomRole && (
                <input
                  id="custom-role-input"
                  type="text"
                  className="form-input mt-8"
                  placeholder="e.g., iOS Developer, QA Engineer..."
                  value={customRole}
                  onChange={e => { setCustomRole(e.target.value); setRoleError(''); onTargetRoleChange(e.target.value); }}
                />
              )}
              {roleError
                ? <p role="alert" className="field-error">{roleError}</p>
                : <p className="field-hint">📊 Skills matched against 20+ predefined keywords for this role</p>
              }
            </div>

            <div className="ats-weights-info">
              <div className="ats-weights-title"><span aria-hidden="true">⚖️</span> ATS Scoring Weights</div>
              <div className="ats-weights-list">
                {[
                  { label: 'Skills Match', pct: 40, color: '#7c3aed' },
                  { label: 'Experience Quality', pct: 20, color: '#2563eb' },
                  { label: 'Projects Quality', pct: 20, color: '#06b6d4' },
                  { label: 'Formatting', pct: 20, color: '#10b981' },
                ].map(w => (
                  <div key={w.label} className="ats-weight-row">
                    <span className="ats-weight-label">{w.label}</span>
                    <div className="ats-weight-bar-track">
                      <div className="ats-weight-bar-fill" style={{ width: `${w.pct}%`, background: w.color }} />
                    </div>
                    <span className="ats-weight-pct" style={{ color: w.color }}>{w.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="how-it-works">
              <div className="ats-weights-title"><span aria-hidden="true">⚙️</span> How It Works</div>
              <div className="how-it-works-steps">
                {[
                  ['📂', 'Extracts text from PDF/DOCX locally'],
                  ['🔍', 'Matches skills against role keyword library'],
                  ['⚡', 'Scores action verbs vs. vague phrases'],
                  ['📊', 'Applies ATS scoring formula'],
                  ['✍️', 'Suggests rewrites & improvements'],
                ].map(([icon, text]) => (
                  <div key={text} className="how-step">
                    <span aria-hidden="true">{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="upload-form-right">
            {file && (
              <div className="file-preview">
                <div className="file-preview-icon" aria-hidden="true">{getFileIcon(file)}</div>
                <div className="file-preview-info">
                  <div className="file-preview-name" title={file.name}>{file.name}</div>
                  <div className="file-preview-size">{formatFileSize(file.size)}</div>
                </div>
                <button className="file-preview-remove" onClick={() => { onFileChange(null); setFileError(''); }} type="button" aria-label="Remove file">✕</button>
              </div>
            )}

            <div
              {...getRootProps({
                className: `dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`,
                id: 'resume-dropzone',
              })}
            >
              <input {...getInputProps()} />
              <div className="dropzone-icon" aria-hidden="true">
                {file ? '✅' : isDragActive ? '📂' : '📤'}
              </div>
              <div className="dropzone-title">
                {file ? 'File ready — drop to replace' : isDragActive ? 'Release to upload' : 'Drag & drop your resume'}
              </div>
              <p className="dropzone-subtitle">
                {file ? file.name : isDragActive ? 'Almost there...' : 'or click to browse your files'}
              </p>
              {!file && (
                <div className="dropzone-formats">
                  {['PDF', 'DOCX', 'DOC', 'TXT'].map(fmt => <span key={fmt} className="format-badge">{fmt}</span>)}
                </div>
              )}
            </div>

            {fileError && <p role="alert" className="field-error" style={{ textAlign: 'center', marginTop: '12px' }}>{fileError}</p>}

            <button
              id="analyze-btn"
              className="btn btn-primary btn-lg btn-full mt-24"
              onClick={handleAnalyze}
              disabled={isLoading}
              type="button"
            >
              {isLoading
                ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Analyzing...</>
                : <><span aria-hidden="true">🚀</span> Run ATS Analysis</>
              }
            </button>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '12px' }}>
              ⚡ Instant results — runs locally in your browser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
