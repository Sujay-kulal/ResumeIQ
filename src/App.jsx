import { useEffect, useRef, useState } from 'react';
import { onAuthChange, signOutUser } from './firebase';
import { apiAnalyzeResume } from './api';
import Sidebar           from './components/Sidebar';
import Topbar            from './components/Topbar';
import DashboardHome     from './components/DashboardHome';
import LandingPage       from './components/LandingPage';
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
import ResumeFixIt       from './components/ResumeFixIt';
import { extractResumeText } from './utils/extractText';
import { analyzeResume }     from './utils/analyzeResume';
import { generateAndAnalyze } from './utils/generateResume';

const THEME_KEY = 'resumeiq_theme';

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

  // showAuth: controls whether to show auth page vs landing page (for logged-out users)
  const [showAuth,  setShowAuth]  = useState(false);
  const [showFixItModal, setShowFixItModal] = useState(false);
  
  // ── Mode / View ────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState('home'); // 'home', 'analyze', 'build', 'github', 'settings'

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

  const handleLogin  = (u) => {
    setUser(u);
    setCurrentView('home');
  };
  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // Firebase sign-out failed, clear locally anyway
    }
    setUser(null);
    setShowAuth(false);
    setResult(null);
    setBuildResult(null);
    setError(null);
  };

  // Legacy cleanups removed 


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

  // ── GitHub tab states removed ────────────────

  const resultsRef = useRef(null);
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const switchMode = (m) => setCurrentView(m);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === 'home') {
      setError(null);
    }
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
    setCurrentView('build');
    alert('✅ Projects added! Switch to Build mode — your projects section is pre-filled.');
  };

  const handleApplyFixes = ({ acceptedBullets, addedSkills }) => {
    setShowFixItModal(false);
    const existing = sessionStorage.getItem('resumeiq_builder_form');
    const form = existing ? JSON.parse(existing) : { targetRole: analyzedRole || targetRole };
    
    let addedExperience = acceptedBullets.map(b => b.improved).join('\n\n');
    let addedSkillsText = addedSkills.join(', ');

    const updated = {
      ...form,
      experience: form.experience ? form.experience + '\n\n' + addedExperience : addedExperience,
      skills: (form.skills ? form.skills + (addedSkillsText ? ', ' : '') : '') + addedSkillsText
    };
    
    sessionStorage.setItem('resumeiq_builder_form', JSON.stringify(updated));
    setCurrentView('build');
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

  // ── Not logged in → Landing or Auth ────────────────────────────
  if (!user) {
    if (!showAuth) {
      return (
        <LandingPage
          onAnalyze={() => { setCurrentView('analyze'); setShowAuth(true); setAuthView('login'); }}
          onBuild={() => { setCurrentView('build'); setShowAuth(true); setAuthView('login'); }}
        />
      );
    }
    return authView === 'login'
      ? <Login  onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />
      : <Signup onLogin={handleLogin} onSwitchToLogin={() => setAuthView('login')}  />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        currentView={currentView} 
        onNavigate={navigateTo} 
        onLogout={handleLogout} 
      />

      <main className="main-content">
        <Topbar 
          user={user} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          currentView={currentView} 
          onNavigate={navigateTo} 
        />

        <div className="content-scrollable">
          {hasResults && <Confetti score={activeScore} />}
          {isActive && <AnalysisLoader currentStep={currentStep} />}

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

          {currentView === 'home' && (
            <DashboardHome 
              onNavigate={navigateTo} 
              hasData={hasResults || activeScore > 0} 
              lastScore={activeScore} 
            />
          )}

          {/* ── ANALYZE FLOW ── */}
          {currentView === 'analyze' && (
            <div className="analyze-flow-container">
              {!result && !isActive && (
                <ResumeUploader
                  file={file}                    onFileChange={setFile}
                  targetRole={targetRole}        onTargetRoleChange={setTargetRole}
                  onAnalyze={handleAnalyze}      isLoading={isLoading}
                />
              )}

              {result && !isLoading && (
                <div className="analyze-step-3">
                  <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <button className="btn btn-outline" onClick={handleReset} type="button">
                        ← Back
                      </button>
                      <h2 style={{ margin: 0 }}>Analysis Report</h2>
                    </div>
                  </div>
                  <section className="results-section">
                    <ScoreDashboard data={result} targetRole={analyzedRole} onSwitchMode={switchMode} onFixIt={() => setShowFixItModal(true)} />
                    <div className="divider" style={{ margin: '40px 0' }} />
                    <AnalysisPanels data={result} />
                  </section>
                </div>
              )}
            </div>
          )}

          {currentView === 'build' && (
            <div className={`app-body${hasResults ? ' has-results' : ''}`}>
              <div className="split-left">
                {!buildResult ? (
                  <ResumeBuilder onGenerate={handleGenerate} isLoading={isBuilding} />
                ) : (
                  <div className="split-left-sticky-bar">
                    <div className="split-left-bar-emoji">✨</div>
                    <div className="split-left-bar-title">Resume Generated</div>
                    <div className="split-left-bar-btns">
                      <button className="btn btn-primary" onClick={handleBuilderReset} type="button">🔄 Build Another</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="split-right">
                {buildResult && !isBuilding && (
                  <section className="results-section">
                    <ResumeOutput data={buildResult} targetRole={buildRole} onReset={handleBuilderReset} />
                  </section>
                )}
              </div>
            </div>
          )}

          {currentView === 'github' && (
            <div className="container" style={{ maxWidth: '800px', marginTop: '40px' }}>
              <GitHubIntegration onAddProjects={handleAddGithubProjects} />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <h2>Settings</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Configuration options will appear here.</p>
            </div>
          )}
        </div>
      </main>
      {showFixItModal && result && (
        <ResumeFixIt
          data={result}
          onClose={() => setShowFixItModal(false)}
          onApply={handleApplyFixes}
        />
      )}
    </div>
  );
}
