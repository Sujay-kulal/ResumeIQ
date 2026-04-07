import { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '../firebase';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // ─── Map Firebase error codes to user-friendly messages ────
  const firebaseError = (err) => {
    const map = {
      'auth/user-not-found':          'No account found with that email. Please sign up.',
      'auth/wrong-password':          'Incorrect password. Please try again.',
      'auth/invalid-email':           'Please enter a valid email address.',
      'auth/too-many-requests':       'Too many failed attempts. Please wait and try again.',
      'auth/user-disabled':           'This account has been disabled.',
      'auth/network-request-failed':  'Network error. Check your internet connection.',
      'auth/invalid-credential':      'Invalid email or password. Please try again.',
    };
    return map[err.code] || err.message || 'An unexpected error occurred.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const user = await signInWithEmail(email.trim(), password);
      onLogin({
        uid:   user.uid,
        name:  user.displayName || email.split('@')[0],
        email: user.email,
        photo: user.photoURL,
      });
    } catch (err) {
      setError(firebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      onLogin({
        uid:   user.uid,
        name:  user.displayName || 'User',
        email: user.email,
        photo: user.photoURL,
      });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(firebaseError(err));
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

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email" type="email" className={`auth-input ${error && !email ? 'error' : ''}`}
              placeholder="you@example.com" value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <input
              id="login-password" type="password" className="auth-input"
              placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
          </div>
          <button id="login-btn" className="auth-btn" type="submit" disabled={loading}>
            {loading ? '⟳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <button className="auth-google-btn" type="button" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-switch">
          Don&apos;t have an account?{' '}
          <button className="auth-switch-btn" type="button" onClick={onSwitchToSignup}>Create Account</button>
        </div>
      </div>
    </div>
  );
}
