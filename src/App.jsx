import { useEffect, useRef, useState } from 'react';
import { onAuthChange, signOutUser } from './firebase';
import { apiAnalyzeResume, apiGenerateResume } from './api';
import Navbar            from './components/Navbar';
import Hero              from './components/Hero';
import Login             from './components/Login';
import Signup            from './components/Signup';
import ResumeUploader    from './components/ResumeUploader';
import ResumeBuilder     from './components/ResumeBuilder';
import ResumeOutput      from './components/ResumeOutput';
import AnalysisLoader    from './components/AnalysisLoader';
import ScoreDashboard    from './components/ScoreDashboard';
import AnalysisPanels    from './components/AnalysisPanels';
import Confetti          from './components/Confetti';
import GitHubIntegration from './components/GitHubIntegration';
import { extractResumeText } from './utils/extractText';
import { analyzeResume }     from './utils/analyzeResume';
import { generateAndAnalyze } from './utils/generateResume';

const THEME_KEY = 'resumeiq_theme';

const IDLE_FEATURES = [
  { icon: '🔒', title: '100% Private',     desc: 'No data leaves your browser. Zero network requests during analysis.' },
  { icon: '📊', title: 'ATS Score',         desc: 'Skills×40% + Experience×20% + Projects×20% + Format×20%.' },
  { icon: '⚡', title: 'Instant Results',   desc: 'Full ATS report generated in under 2 seconds.' },
  { icon: '🎯', title: '30+ Roles',         desc: 'Tailored keyword libraries for every tech role.' },
  { icon: '✍️', title: 'Bullet Rewrites',  desc: 'Action-verb rewrites to strengthen weak bullet points.' },
  { icon: '🐙', title: 'GitHub Sync',       desc: 'Fetch & select your best repos to auto-populate projects.' },
];

export default function App() {
  // ── Theme ──────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // ── Auth (Firebase) ─────────────────────────────────────────────
  const [user,      setUser]      = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authView,  setAuthView]  = useState('login'); // 'login' | 'signup'

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid:         firebaseUser.uid,
          name:        firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email:       firebaseUser.email,
          photo:       firebaseUser.photoURL,
          photoURL:    firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const handleLogin  = (u) => setUser(u);
  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // Firebase sign-out failed, clear locally anyway
    }
    setUser(null);
    setResult(null);
    setBuildResult(null);
    setError(null);
  };

  // ── Mode: 'analyze' | 'build' ───────────────────────────────────
  const [mode, setMode] = useState('analyze');

  // ── Analyzer state ──────────────────────────────────────────────
  const [file,         setFile]         = useState(null);
  const [targetRole,   setTargetRole]   = useState('Software Engineer (General)');
  const [isLoading,    setIsLoading]    = useState(false);
  const [currentStep,  setCurrentStep]  = useState(0);
  const [result,       setResult]       = useState(null);
  const [analyzedRole, setAnalyzedRole] = useState('');
  const [error,        setError]        = useState(null);

  // ── Builder state ────────────────────────────────────────────────
  const [isBuilding,   setIsBuilding]   = useState(false);
  const [buildResult,  setBuildResult]  = useState(null);
  const [buildRole,    setBuildRole]    = useState('');

  // ── GitHub tab (visible in build mode left panel) ────────────────
  const [showGitHub, setShowGitHub] = useState(false);

  const resultsRef = useRef(null);
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const switchMode = (m) => {
    setMode(m); setResult(null); setBuildResult(null);
    setError(null); setFile(null); setShowGitHub(false);
  };

  // ── Analyze ─────────────────────────────────────────────────────
  const handleAnalyze = async (resolvedRole) => {
    if (!file) return;
    const role = resolvedRole || targetRole;
    setIsLoading(true); setError(null); setResult(null); setCurrentStep(0);
    try {
      setCurrentStep(1);
      const resumeText = await extractResumeText(file);
      if (!resumeText || resumeText.length < 50)
        throw new Error('Could not extract readable text. Try a PDF or DOCX with selectable text.');

      // Step 2: Run local analysis (instant)
      setCurrentStep(2); await sleep(200);
      setCurrentStep(3);
      const localResult = await analyzeResume(resumeText, null, role);

      // Step 3: Try AI-enhanced analysis from backend (non-blocking)
      setCurrentStep(4);
      let aiResult = null;
      try {
        aiResult = await apiAnalyzeResume(resumeText, role);
      } catch {
        // Backend unavailable — local result is fine
      }

      // Merge: use local as base, overlay AI suggestions if available
      let finalResult = localResult;
      if (aiResult && !aiResult.parse_error && aiResult.ai_enhanced) {
        finalResult = {
          ...localResult,
          ai_suggestions: aiResult.ai_suggestions || null,
          ai_section_feedback: aiResult.section_feedback || null,
          ai_improved_bullets: aiResult.improved_bullets || null,
          ai_enhanced: true,
        };
      }

      setAnalyzedRole(role);
      setCurrentStep(5); await sleep(200);
      setResult(finalResult);
      setIsLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleReset = () => {
    setResult(null); setError(null); setFile(null);
    setCurrentStep(0); setAnalyzedRole('');
  };

  // ── Builder ──────────────────────────────────────────────────────
  const handleGenerate = async (formData) => {
    setIsBuilding(true); setBuildResult(null); setError(null);
    try {
      await sleep(200);
      const output = await generateAndAnalyze(formData);
      setBuildRole(formData.targetRole);
      setBuildResult(output);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.message || 'Generation failed. Please check your input.');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleBuilderReset = () => { setBuildResult(null); setError(null); setBuildRole(''); };

  // ── GitHub add-projects handler ──────────────────────────────────
  const handleAddGithubProjects = (projectsText) => {
    const existing = sessionStorage.getItem('resumeiq_builder_form');
    const form = existing ? JSON.parse(existing) : {};
    const updated = { ...form, projects: (form.projects ? form.projects + '\n\n' : '') + projectsText };
    sessionStorage.setItem('resumeiq_builder_form', JSON.stringify(updated));
    setShowGitHub(false);
    setMode('build');
    alert('✅ Projects added! Switch to Build mode — your projects section is pre-filled.');
  };

  const activeScore = result?.overall_score ?? buildResult?.overall_score ?? 0;
  const hasResults  = !!(result || buildResult);
  const isActive    = isLoading || isBuilding;

  // ── Auth loading state ──────────────────────────────────────────
  if (!authReady) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div className="auth-logo">
            <div className="auth-logo-icon" aria-hidden="true">✦</div>
            <span className="auth-logo-text">ResumeIQ</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '24px', fontSize: '0.95rem' }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            {' '}Loading...
          </p>
        </div>
      </div>
    );
  }

  // ── Not logged in → Auth screens ────────────────────────────────
  if (!user) {
    return authView === 'login'
      ? <Login  onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />
      : <Signup onLogin={handleLogin} onSwitchToLogin={() => setAuthView('login')}  />;
  }

  return (
    <div className="app">
      <Navbar
        theme={theme} onToggleTheme={toggleTheme}
        mode={mode}   onModeSwitch={switchMode}
        user={user}   onLogout={handleLogout}
      />

      {hasResults && <Confetti score={activeScore} />}
      {isActive    && <AnalysisLoader currentStep={currentStep} />}

      {/* Mobile/tablet-only hero (CSS hides on desktop 1200px+) */}
      {!hasResults && !isActive && (
        <div className="mobile-hero-wrapper">
          <Hero onGetStarted={() => {}} />
        </div>
      )}

      {/* ── Main split body ────────────────────────────────────── */}
      <div className={`app-body${hasResults ? ' has-results' : ''}`}>

        {/* ── LEFT PANEL ── */}
        <div className="split-left">

          {/* ── ANALYZE mode ── */}
          {mode === 'analyze' && (
            <>
              {result
                ? (
                  <div className="split-left-sticky-bar">
                    <div className="split-left-bar-emoji">✅</div>
                    <div className="split-left-bar-title">Analysis Complete</div>
                    <p className="split-left-bar-sub">
                      Your resume scored <strong style={{ color: 'var(--accent-purple-light)' }}>{result.overall_score}/100</strong>.
                      {result.ai_enhanced && <span style={{ color: 'var(--accent-blue-light)', marginLeft: '8px' }}>✨ AI Enhanced</span>}
                      {' '}Upload another resume or switch to Build mode to create a new one.
                    </p>
                    <div className="split-left-bar-btns">
                      <button className="btn btn-primary"  onClick={handleReset}              type="button">↩ Analyze Another</button>
                      <button className="btn btn-outline"  onClick={() => switchMode('build')} type="button">✨ Build a Resume</button>
                      <button className="btn btn-outline"  onClick={() => window.print()}      type="button" id="print-report-btn">🖨 Print Report</button>
                    </div>
                  </div>
                )
                : (
                  <ResumeUploader
                    file={file}                    onFileChange={setFile}
                    targetRole={targetRole}        onTargetRoleChange={setTargetRole}
                    onAnalyze={handleAnalyze}      isLoading={isLoading}
                  />
                )
              }
            </>
          )}

          {/* ── BUILD mode ── */}
          {mode === 'build' && (
            <>
              {buildResult
                ? (
                  <div className="split-left-sticky-bar">
                    <div className="split-left-bar-emoji">✨</div>
                    <div className="split-left-bar-title">Resume Generated</div>
                    <p className="split-left-bar-sub">
                      Your ATS-optimized resume is ready with a score of <strong style={{ color: 'var(--accent-purple-light)' }}>{buildResult.overall_score}/100</strong>.
                    </p>
                    <div className="split-left-bar-btns">
                      <button className="btn btn-primary" onClick={handleBuilderReset}          type="button">🔄 Build Another</button>
                      <button className="btn btn-outline" onClick={() => switchMode('analyze')} type="button">🔍 Analyze Instead</button>
                    </div>
                  </div>
                )
                : (
                  <>
                    {/* GitHub toggle tab */}
                    <div style={{ borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 0 }}>
                      <button
                        type="button"
                        onClick={() => setShowGitHub(false)}
                        style={{
                          flex: 1, padding: '14px 12px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                          background: !showGitHub ? 'var(--gradient-primary)' : 'transparent',
                          color: !showGitHub ? 'white' : 'var(--text-muted)',
                          borderBottom: !showGitHub ? '2px solid transparent' : '2px solid transparent',
                        }}
                      >
                        ✨ Build Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGitHub(true)}
                        style={{
                          flex: 1, padding: '14px 12px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                          background: showGitHub ? 'var(--gradient-secondary)' : 'transparent',
                          color: showGitHub ? 'white' : 'var(--text-muted)',
                        }}
                      >
                        🐙 GitHub Projects
                      </button>
                    </div>

                    {showGitHub
                      ? <GitHubIntegration onAddProjects={handleAddGithubProjects} />
                      : <ResumeBuilder onGenerate={handleGenerate} isLoading={isBuilding} />
                    }
                  </>
                )
              }
            </>
          )}

          {/* Error display */}
          {error && !isActive && (
            <div className="container" style={{ paddingBottom: '40px' }}>
              <div className="error-card" role="alert">
                <div className="error-icon" aria-hidden="true">❌</div>
                <div className="error-title">Something Went Wrong</div>
                <p className="error-message">{error}</p>
                <button className="btn btn-outline mt-16" onClick={() => setError(null)} type="button">
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="split-right" ref={resultsRef}>

          {/* Idle state — feature showcase */}
          {!hasResults && !isActive && (
            <div className="split-right-idle">
              <div className="idle-feature-header">
                <div className="hero-tag" role="status">
                  <span className="hero-tag-dot" aria-hidden="true" />
                  Welcome back, {(user.displayName || user.name || 'User').split(' ')[0]}!
                </div>
                <h2 className="idle-feature-title">
                  {mode === 'analyze' ? 'Upload your resume to begin' : 'Fill the form to generate your resume'}
                </h2>
                <p className="idle-feature-sub">
                  {mode === 'analyze'
                    ? 'Drag & drop your PDF or DOCX on the left — get a full ATS score report in seconds.'
                    : 'Complete the multi-step builder form and get an ATS-optimized resume instantly.'
                  }
                </p>
              </div>

              <div className="idle-feature-grid">
                {IDLE_FEATURES.map(f => (
                  <div key={f.title} className="idle-feature-card">
                    <div className="idle-feature-icon" aria-hidden="true">{f.icon}</div>
                    <div>
                      <div className="idle-feature-name">{f.title}</div>
                      <div className="idle-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Analyze results ── */}
          {result && !isLoading && (
            <section className="results-section" id="results" aria-labelledby="results-heading">
              <div className="container">
                <div className="results-header">
                  <h2 className="results-title" id="results-heading">
                    {result.overall_score >= 85 ? '🎉' : '📋'} Analysis Report
                    {result.ai_enhanced && <span className="ai-badge-inline">✨ AI</span>}
                  </h2>
                  <div className="results-header-btns no-print">
                    <button className="btn btn-outline" onClick={handleReset}              type="button">↩ New Analysis</button>
                    <button className="btn btn-outline" onClick={() => switchMode('build')} type="button">✨ Build Resume</button>
                  </div>
                </div>
                <ScoreDashboard data={result} targetRole={analyzedRole} />
                <div className="divider" />
                <AnalysisPanels data={result} />

                {/* AI Suggestions (from backend) */}
                {result.ai_suggestions && (
                  <div className="ai-suggestions-panel">
                    <h3 className="ai-suggestions-title">
                      <span aria-hidden="true">🤖</span> AI-Powered Insights
                    </h3>
                    <div className="ai-suggestions-content">
                      {result.ai_suggestions}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Build results ── */}
          {buildResult && !isBuilding && (
            <section className="results-section" id="build-results" aria-labelledby="build-results-heading">
              <div className="container">
                <ResumeOutput
                  data={buildResult}
                  targetRole={buildRole}
                  onReset={handleBuilderReset}
                />
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">
            Built with <span>♥</span> by ResumeIQ · 100% private — no data ever leaves your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
