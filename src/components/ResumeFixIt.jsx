import { useState } from 'react';

export default function ResumeFixIt({ data, onClose, onApply }) {
  const { improved_bullets = [], missing_keywords = [] } = data;

  const [bulletsState, setBulletsState] = useState(() => 
    improved_bullets.map((b, i) => ({
      id: i,
      original: b.original,
      text: b.improved,
      status: 'accepted' 
    }))
  );

  const [selectedSkills, setSelectedSkills] = useState(() => 
    missing_keywords.reduce((acc, kw) => {
      acc[kw] = true; 
      return acc;
    }, {})
  );

  const [currentTab, setCurrentTab] = useState('bullets'); 

  const handleAction = (id, action) => {
    setBulletsState(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
  };

  const handleTextChange = (id, newText) => {
    setBulletsState(prev => prev.map(b => b.id === id ? { ...b, text: newText } : b));
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => ({ ...prev, [skill]: !prev[skill] }));
  };

  const handleFinish = () => {
    const acceptedBullets = bulletsState.filter(b => b.status === 'accepted').map(b => ({
      original: b.original,
      improved: b.text
    }));
    
    const addedSkills = Object.keys(selectedSkills).filter(k => selectedSkills[k]);
    
    onApply({
      acceptedBullets,
      addedSkills
    });
  };

  return (
    <div className="modal-overlay fix-it-modal-overlay">
      <div className="modal-content fix-it-modal" role="dialog" aria-labelledby="fix-it-title">
        <div className="modal-header">
          <div>
            <h2 id="fix-it-title" className="modal-title"><span aria-hidden="true">🛠️</span> Resume Fix-It Wizard</h2>
            <p className="modal-subtitle">Review AI suggestions and apply them directly to your resume.</p>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close modal">✕</button>
        </div>

        <div className="tabs-root" style={{ marginTop: '16px' }}>
          <div className="tabs-bar" role="tablist">
            <button
              className={`tab-btn ${currentTab === 'bullets' ? 'active' : ''}`}
              onClick={() => setCurrentTab('bullets')}
              type="button"
              role="tab"
            >
              ✍️ Bullet Fixes <span className="tab-count">{improved_bullets.length}</span>
            </button>
            <button
              className={`tab-btn ${currentTab === 'skills' ? 'active' : ''}`}
              onClick={() => setCurrentTab('skills')}
              type="button"
              role="tab"
            >
              ⚡ Missing Skills <span className="tab-count">{missing_keywords.length}</span>
            </button>
          </div>
        </div>

        <div className="modal-body fix-it-body">
          {currentTab === 'bullets' && (
            <div className="fix-list">
              {bulletsState.length === 0 ? (
                <p className="empty-state">No weak bullets found. Great job!</p>
              ) : (
                bulletsState.map((bullet) => (
                  <div key={bullet.id} className={`fix-card status-${bullet.status}`}>
                    <div className="fix-card-content">
                      <div className="bullet-compare">
                        <div className="bullet-before">
                          <div className="bullet-label">❌ Original</div>
                          <p>{bullet.original}</p>
                        </div>
                        <div className="bullet-arrow">↓</div>
                        <div className="bullet-after">
                          <div className="bullet-label">✅ AI Suggestion</div>
                          {bullet.status === 'editing' ? (
                            <textarea
                              className="form-input form-textarea"
                              value={bullet.text}
                              onChange={(e) => handleTextChange(bullet.id, e.target.value)}
                              rows={3}
                            />
                          ) : (
                            <p>{bullet.text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="fix-card-actions">
                      {bullet.status !== 'accepted' && (
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleAction(bullet.id, 'accepted')}
                          type="button"
                        >
                          Accept
                        </button>
                      )}
                      {bullet.status !== 'rejected' && (
                        <button 
                          className="btn btn-outline" 
                          style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
                          onClick={() => handleAction(bullet.id, 'rejected')}
                          type="button"
                        >
                          Reject
                        </button>
                      )}
                      {bullet.status !== 'editing' && (
                        <button 
                          className="btn btn-outline"
                          onClick={() => handleAction(bullet.id, 'editing')}
                          type="button"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    
                    {bullet.status === 'rejected' && (
                      <div className="fix-rejected-overlay">
                        <span>❌ Suggestion Ignored</span>
                        <button className="btn btn-sm btn-outline" onClick={() => handleAction(bullet.id, 'accepted')} type="button">Restore</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {currentTab === 'skills' && (
            <div className="fix-list">
              {missing_keywords.length === 0 ? (
                <p className="empty-state">No missing keywords found.</p>
              ) : (
                <div className="skills-grid-selector">
                  <p className="field-hint" style={{ marginBottom: '16px' }}>
                    Select the missing skills you possess to add them to your resume automatically.
                  </p>
                  <div className="keywords-grid">
                    {missing_keywords.map((kw, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`keyword-chip ${selectedSkills[kw] ? 'keyword-matched' : 'keyword-missing'}`}
                        onClick={() => toggleSkill(kw)}
                      >
                        {selectedSkills[kw] ? '✅' : '+'} {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={handleFinish} type="button">
            Apply Fixes to Builder 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
