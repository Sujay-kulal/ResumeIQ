import { useState } from 'react';

function scoreRepo(repo) {
  let s = 0;
  if (repo.description)                s += 2;
  if (repo.language)                   s += 2;
  if ((repo.stargazers_count || 0) > 0) s += 2;
  if ((repo.forks_count || 0) > 0)      s += 1;
  if (!repo.fork)                       s += 2;
  if (repo.topics?.length > 0)          s += 1;
  return s;
}

const TECH_COLORS = {
  JavaScript:'#f0db4f', TypeScript:'#3178c6', Python:'#3572a5', Java:'#b07219',
  'C++':'#f34b7d', Go:'#00add8', Rust:'#dea584', Ruby:'#701516', Swift:'#ffac45',
  Kotlin:'#a97bff', HTML:'#e34c26', CSS:'#563d7c', Shell:'#89e051',
};

export default function GitHubIntegration({ onAddProjects }) {
  const [username,   setUsername]   = useState('');
  const [repos,      setRepos]      = useState([]);
  const [selected,   setSelected]   = useState(new Set());
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [fetched,    setFetched]    = useState(false);

  const fetchRepos = async () => {
    const u = username.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
    if (!u) { setError('Please enter a GitHub username or profile URL.'); return; }
    setLoading(true); setError(''); setFetched(false); setRepos([]); setSelected(new Set());
    try {
      const res = await fetch(`https://api.github.com/users/${u}/repos?per_page=50&sort=updated`);
      if (res.status === 404) throw new Error(`User "${u}" not found on GitHub.`);
      if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Try again in a minute.');
      if (!res.ok)            throw new Error('Failed to fetch repositories. Please try again.');
      const data = await res.json();
      const scored = data
        .filter(r => !r.fork || r.stargazers_count > 0)
        .map(r => ({ ...r, _score: scoreRepo(r) }))
        .sort((a, b) => b._score - a._score);
      setRepos(scored);
      // Auto-select top recommended (score >= 5)
      const auto = new Set(scored.filter(r => r._score >= 5).slice(0, 6).map(r => r.id));
      setSelected(auto);
      setFetched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRepo = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleAdd = () => {
    const chosenRepos = repos.filter(r => selected.has(r.id));
    const projects = chosenRepos.map(r =>
      `${r.name}${r.description ? ' — ' + r.description : ''}` +
      (r.language ? ` [${r.language}]` : '')
    ).join('\n\n');
    onAddProjects?.(projects, chosenRepos);
  };

  return (
    <section className="github-section" aria-labelledby="github-heading">
      <div className="container">
        <h2 className="section-title" id="github-heading">
          <span aria-hidden="true">🐙</span> GitHub Project Selector
        </h2>
        <p className="section-subtitle">
          Fetch your public repositories and select which ones to include in your resume
        </p>

        {}
        <div className="github-input-row">
          <input
            id="github-username-input"
            type="text"
            className="form-input"
            placeholder="github.com/username or just username"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && fetchRepos()}
            aria-label="GitHub username or profile URL"
          />
          <button
            id="github-fetch-btn"
            className="github-fetch-btn"
            onClick={fetchRepos}
            disabled={loading}
            type="button"
          >
            {loading
              ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Fetching...</>
              : <><span aria-hidden="true">🔍</span> Fetch Projects</>
            }
          </button>
        </div>

        {error && (
          <div className="error-card" style={{ maxWidth: 640, margin: '0 auto 24px' }} role="alert">
            <div className="error-title" style={{ fontSize: '0.95rem' }}>⚠️ {error}</div>
          </div>
        )}

        {}
        {loading && (
          <div className="github-loading" aria-live="polite">
            <div className="github-spinner" aria-hidden="true" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Fetching repositories from GitHub…
            </p>
          </div>
        )}

        {}
        {fetched && !loading && repos.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            No public repositories found for this account.
          </p>
        )}

        {}
        {fetched && repos.length > 0 && (
          <>
            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ font: '0.82rem/1 var(--font-sans)', color: 'var(--text-muted)' }}>
                {repos.length} repositories found
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-purple-light)', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', padding: '3px 10px', borderRadius: 20 }}>
                ⭐ {repos.filter(r => r._score >= 5).length} recommended
              </span>
            </div>

            <div className="github-repos-grid" role="list" aria-label="GitHub repositories">
              {repos.map(repo => {
                const isSelected    = selected.has(repo.id);
                const isRecommended = repo._score >= 5;
                return (
                  <div
                    key={repo.id}
                    role="listitem"
                    className={`github-repo-card${isSelected ? ' selected' : ''}${isRecommended && !isSelected ? ' recommended' : ''}`}
                    onClick={() => toggleRepo(repo.id)}
                    aria-pressed={isSelected}
                    tabIndex={0}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleRepo(repo.id)}
                  >
                    {}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      {}
                      <div className="github-checkbox-v2" aria-hidden="true">
                        {isSelected ? '✓' : ''}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="github-repo-name">{repo.name}</div>
                        <div className="github-repo-badges">
                          {isRecommended && <span className="github-badge recommended">⭐ Recommended</span>}
                          {isSelected    && <span className="github-badge selected-badge">✓ Selected</span>}
                        </div>
                      </div>
                    </div>

                    {repo.description && (
                      <p className="github-repo-desc">{repo.description}</p>
                    )}

                    <div className="github-repo-tech">
                      {repo.language && (
                        <span className="github-tech-tag" style={{
                          borderColor: `${TECH_COLORS[repo.language] || '#60a5fa'}40`,
                          color: TECH_COLORS[repo.language] || 'var(--accent-blue-light)',
                          background: `${TECH_COLORS[repo.language] || '#60a5fa'}15`,
                        }}>
                          {repo.language}
                        </span>
                      )}
                      {(repo.topics || []).slice(0, 3).map(t => (
                        <span key={t} className="github-tech-tag">{t}</span>
                      ))}
                    </div>

                    <div className="github-repo-meta">
                      {repo.stargazers_count > 0 && <span>⭐ {repo.stargazers_count}</span>}
                      {repo.forks_count > 0       && <span>🍴 {repo.forks_count}</span>}
                      {repo.updated_at && (
                        <span>Updated {new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="github-actions-row">
              <p className="github-select-count">
                <strong>{selected.size}</strong> of {repos.length} repositories selected
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button" className="btn btn-outline"
                  onClick={() => setSelected(new Set(repos.filter(r => r._score >= 5).slice(0, 6).map(r => r.id)))}
                >
                  ↺ Reset to Recommended
                </button>
                {selected.size > 0 && (
                  <button
                    id="add-github-projects-btn"
                    type="button" className="btn btn-primary"
                    onClick={handleAdd}
                  >
                    ✅ Add {selected.size} Project{selected.size > 1 ? 's' : ''} to Resume
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
