import { useState } from 'react';
import { signUpWithEmail } from '../firebase';

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
    <div className="auth-page">
      <div className="auth-card">
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
              placeholder="Sujay Mehta" value={form.name}
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
  );
}
