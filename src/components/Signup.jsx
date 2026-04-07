import { useState } from 'react';
import { signUpWithEmail } from '../firebase';

/** Small decorative score ring used on the left panel */
function MiniScoreRing() {
  return (
    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <defs>
          <linearGradient id="signup-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="url(#signup-ring-grad)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="326"
          strokeDashoffset="48"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4', lineHeight: 1 }}>92</div>
        <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>ATS Score</div>
      </div>
    </div>
  );
}

export default function Signup({ onLogin, onSwitchToLogin }) {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // ─── Map Firebase error codes to friendly messages ─────────
  const firebaseError = (err) => {
    const map = {
      'auth/email-already-in-use':    'An account with this email already exists.',
      'auth/invalid-email':           'Please enter a valid email address.',
      'auth/weak-password':           'Password must be at least 6 characters.',
      'auth/operation-not-allowed':   'Email/password accounts are not enabled. Contact support.',
      'auth/network-request-failed':  'Network error. Check your internet connection.',
    };
    return map[err.code] || err.message || 'An unexpected error occurred.';
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (form.password.length < 6)  e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const user = await signUpWithEmail(
        form.email.trim(),
        form.password,
        form.name.trim()
      );
      onLogin({
        uid:   user.uid,
        name:  user.displayName || form.name.trim(),
        email: user.email,
        photo: user.photoURL,
      });
    } catch (err) {
      // Map Firebase errors to the right field
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ email: firebaseError(err) });
      } else if (err.code === 'auth/weak-password') {
        setErrors({ password: firebaseError(err) });
      } else {
        setErrors({ email: firebaseError(err) });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* ── LEFT: Product Visual ── */}
      <div className="auth-split-left" aria-hidden="true">
        <div className="auth-split-left-content">
          <div className="auth-split-logo">
            <div className="lp-logo-icon">✦</div>
            <span className="auth-split-logo-text">ResumeIQ</span>
          </div>

          <MiniScoreRing />

          <h2 className="auth-split-headline">
            Build a Resume That <span>Beats the ATS</span>
          </h2>
          <p className="auth-split-sub">
            Create an account to save your progress, access the resume builder, and connect your GitHub projects.
          </p>

          <div className="auth-split-features">
            {[
              'Resume builder with ATS optimization',
              'GitHub repo sync for projects section',
              'AI-powered bullet rewrite suggestions',
              'Save & restore your form progress',
            ].map(f => (
              <div key={f} className="auth-split-feature">
                <div className="auth-split-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Auth Form ── */}
      <div className="auth-split-right">
        <div className="auth-page" style={{ background: 'none', minHeight: 'unset', padding: 0 }}>
          <div className="auth-card" style={{ boxShadow: 'none', border: 'none', background: 'none', maxWidth: 400, width: '100%' }}>
            <div className="auth-logo">
              <div className="auth-logo-icon" aria-hidden="true">✦</div>
              <span className="auth-logo-text">ResumeIQ</span>
            </div>

            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start optimizing your resume for free — no credit card required</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-name">Full Name</label>
                <input id="signup-name" type="text" className={`auth-input ${errors.name ? 'error' : ''}`}
                  placeholder="Your full name" value={form.name}
                  onChange={e => handleChange('name', e.target.value)} autoComplete="name" />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-email">Email address</label>
                <input id="signup-email" type="email" className={`auth-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com" value={form.email}
                  onChange={e => handleChange('email', e.target.value)} autoComplete="email" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-password">Password</label>
                <input id="signup-password" type="password" className={`auth-input ${errors.password ? 'error' : ''}`}
                  placeholder="At least 6 characters" value={form.password}
                  onChange={e => handleChange('password', e.target.value)} autoComplete="new-password" />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-confirm">Confirm Password</label>
                <input id="signup-confirm" type="password" className={`auth-input ${errors.confirm ? 'error' : ''}`}
                  placeholder="Repeat password" value={form.confirm}
                  onChange={e => handleChange('confirm', e.target.value)} autoComplete="new-password" />
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>

              <button id="signup-btn" className="auth-btn" type="submit" disabled={loading}>
                {loading ? '⟳ Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?{' '}
              <button className="auth-switch-btn" type="button" onClick={onSwitchToLogin}>Sign In</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
