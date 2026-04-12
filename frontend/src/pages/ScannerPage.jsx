import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getTeam, getTeams, getJudges, submitEvaluation, getEvaluationByTeam, getEvaluationCount, getEvaluatedTeams } from '../utils/api';

const CRITERIA = [
  { key: 'novelty', label: '1. Novelty', max: 20 },
  { key: 'usage_score', label: '2. Usage', max: 20 },
  { key: 'methodology', label: '3. Methodology', max: 20 },
  { key: 'presentation', label: '4. Presentation', max: 20 },
  { key: 'uniqueness', label: '5. Uniqueness', max: 20 }
];

export default function ScannerPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [judges, setJudges] = useState([]);
  const [selectedJudge, setSelectedJudge] = useState('');
  const [scores, setScores] = useState({
    novelty: 0,
    usage_score: 0,
    methodology: 0,
    presentation: 0,
    uniqueness: 0
  });
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alreadyEvaluated, setAlreadyEvaluated] = useState(null);
  const [submittedEval, setSubmittedEval] = useState(null);
  const [evalCount, setEvalCount] = useState({ count: 0, remaining: 20 });
  const [evaluatedTeams, setEvaluatedTeams] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundLimitReached, setRoundLimitReached] = useState(false);
  const html5QrcodeScanner = useRef(null);

  useEffect(() => {
    if (teamId) {
      loadTeam(teamId);
    }
    loadJudges();
    loadTeams();
  }, [teamId]);

  useEffect(() => {
    return () => {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.clear().catch(() => {});
      }
    };
  }, []);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTeam = async (id) => {
    try {
      setLoading(true);
      const data = await getTeam(id);
      setTeam(data);
      
      const existingEval = await getEvaluationByTeam(id);
      if (existingEval && existingEval.length > 0) {
        setAlreadyEvaluated(existingEval[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadJudges = async () => {
    try {
      const data = await getJudges();
      setJudges(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadEvalCount = async (judgeId, round) => {
    try {
      const data = await getEvaluationCount(judgeId, round);
      setEvalCount({ count: data.teamsEvaluated, remaining: data.teamsRemaining });
      if (data.teamsRemaining <= 0) {
        setRoundLimitReached(true);
      }
      const teams = await getEvaluatedTeams(judgeId, round);
      setEvaluatedTeams(teams.map(t => t.team_id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleJudgeChange = async (judgeId) => {
    setSelectedJudge(judgeId);
    if (judgeId) {
      await loadEvalCount(judgeId, roundNumber);
    }
  };

  const handleRoundChange = async (round) => {
    setRoundNumber(round);
    setRoundLimitReached(false);
    if (selectedJudge) {
      await loadEvalCount(selectedJudge, round);
    }
  };

  const startScanner = () => {
    setShowScanner(true);
    setScannerError('');
    setShowManual(false);
    
    setTimeout(() => {
      try {
        html5QrcodeScanner.current = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        
        html5QrcodeScanner.current.render(
          (decodedText) => {
            let tid;
            try {
              const url = new URL(decodedText);
              tid = url.searchParams.get('team');
            } catch {
              tid = decodedText.includes('team=') ? decodedText.split('team=')[1]?.split('&')[0] : null;
            }
            
            if (tid) {
              html5QrcodeScanner.current.clear().catch(() => {});
              navigate(`/scan/${tid}`);
            } else {
              setScannerError('Invalid QR code format');
            }
          },
          (err) => {
            console.error('Scanner error:', err);
          }
        );
      } catch (err) {
        setScannerError('Unable to start camera. Please use manual entry.');
        setShowScanner(false);
        setShowManual(true);
      }
    }, 100);
  };

  const handleManualEntry = () => {
    setShowManual(true);
    setShowScanner(false);
    setScannerError('');
  };

  const handleTeamSelect = async (e) => {
    const tid = e.target.value;
    setSelectedTeamId(tid);
    if (tid) {
      navigate(`/scan/${tid}`);
    }
  };

  const resetForm = () => {
    setShowScanner(false);
    setShowManual(false);
    setScannerError('');
    setTeam(null);
    setSelectedTeamId('');
    setSelectedJudge('');
    setScores({
      novelty: 0,
      usage_score: 0,
      methodology: 0,
      presentation: 0,
      uniqueness: 0
    });
    setRemarks('');
    setAlreadyEvaluated(null);
    setSubmittedEval(null);
    navigate('/scan');
  };

  const handleScoreChange = (criterion, value) => {
    const numValue = parseInt(value) || 0;
    setScores(prev => ({ ...prev, [criterion]: Math.min(20, Math.max(0, numValue)) }));
  };

  const getTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedJudge) {
      setError('Please select your name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await submitEvaluation({
        teamId: team.id,
        judgeId: selectedJudge,
        roundNumber: roundNumber,
        ...scores,
        remarks
      });
      
      setSubmittedEval({
        ...result,
        team_name: team.team_name,
        judge_name: judges.find(j => j.id === selectedJudge)?.name
      });
      setSuccess('Evaluation submitted successfully!');
      
      await loadEvalCount(selectedJudge, roundNumber);
    } catch (err) {
      if (err.message.includes('Maximum limit')) {
        setError(err.message);
        setRoundLimitReached(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !team && teamId) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (submittedEval) {
    return (
      <div>
        <h2 className="page-title">Evaluation Submitted!</h2>
        
        <div className="card animate-fade-in-up" style={{ marginBottom: 24 }}>
          <h3>{team.team_name}</h3>
          <p><strong>Team Leader:</strong> {team.team_leader}</p>
        </div>
        
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: 16 }}>Evaluation Details</h3>
          <div className="grid grid-2">
            {CRITERIA.map(({ key, label }) => (
              <div key={key}>
                <p style={{ color: 'var(--text-secondary)' }}>{label}: {scores[key]}/20</p>
              </div>
            ))}
          </div>
          <div className="total-score-display" style={{ marginTop: 16 }}>
            <strong>Total: {getTotalScore()}/100</strong>
          </div>
          <p style={{ marginTop: 16 }}><strong>Judged by:</strong> {submittedEval.judge_name}</p>
          <p><strong>Remarks:</strong> {remarks || 'NA'}</p>
        </div>
        
        <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
          <button className="btn btn-primary" onClick={() => navigate('/results')}>
            View All Results
          </button>
          <button className="btn btn-secondary" onClick={resetForm}>
            Evaluate Another Team
          </button>
        </div>
      </div>
    );
  }

  if (alreadyEvaluated) {
    return (
      <div>
        <h2 className="page-title">Team Already Evaluated</h2>
        <div className="card animate-fade-in-up" style={{ marginBottom: 24 }}>
          <h3>{team?.team_name}</h3>
          <p><strong>Team Leader:</strong> {team?.team_leader}</p>
          <p><strong>Details:</strong> {team?.team_details || 'N/A'}</p>
        </div>
        
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: 16 }}>Previous Evaluation (Round {alreadyEvaluated.round_number})</h3>
          <div className="grid grid-2">
            {CRITERIA.map(({ key, label }) => (
              <div key={key}>
                <p style={{ color: 'var(--text-secondary)' }}>{label}: {alreadyEvaluated[key]}/20</p>
              </div>
            ))}
          </div>
          <div className="total-score-display" style={{ marginTop: 16 }}>
            <strong>Total: {alreadyEvaluated.total_score}/100</strong>
          </div>
          <p style={{ marginTop: 16 }}><strong>Judged by:</strong> {alreadyEvaluated.judge_name}</p>
          <p><strong>Remarks:</strong> {alreadyEvaluated.remarks}</p>
        </div>
        
        <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={resetForm}>
          Scan Another Team
        </button>
      </div>
    );
  }

  if (team) {
    return (
      <div>
        <button className="btn btn-secondary animate-fade-in" style={{ marginBottom: 16 }} onClick={resetForm}>
          Back
        </button>
        
        <div className="card animate-fade-in-up" style={{ marginBottom: 24 }}>
          <h3>{team.team_name}</h3>
          <p><strong>Team Leader:</strong> {team.team_leader}</p>
          <p><strong>Details:</strong> {team.team_details || 'N/A'}</p>
          {team.team_members && <p><strong>Team Members:</strong> {team.team_members}</p>}
        </div>

        <h2 className="page-title">Evaluate Team</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Your Name</label>
            <select 
              className="input" 
              value={selectedJudge}
              onChange={(e) => handleJudgeChange(e.target.value)}
              required
            >
              <option value="">-- Select Judge --</option>
              {judges.map(judge => (
                <option key={judge.id} value={judge.id}>{judge.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Round</label>
            <select 
              className="input" 
              value={roundNumber}
              onChange={(e) => handleRoundChange(parseInt(e.target.value))}
              required
            >
              <option value={1}>Round 1 (Max 20 teams)</option>
              <option value={2}>Round 2</option>
              <option value={3}>Round 3</option>
            </select>
            {selectedJudge && (
              <p style={{ marginTop: 8, fontSize: 12, color: roundLimitReached ? 'var(--error)' : 'var(--text-secondary)' }}>
                Teams evaluated: {evalCount.count}/20 {roundLimitReached && <span style={{ color: 'var(--error)' }}>(Limit reached for Round {roundNumber})</span>}
              </p>
            )}
          </div>

          <div className="card animate-fade-in-up" style={{ marginBottom: 24, animationDelay: '0.1s' }}>
            <h3 style={{ marginBottom: 16 }}>Criteria Scores (out of 20 each)</h3>
            {CRITERIA.map(({ key, label }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    max="20"
                    value={scores[key]}
                    onChange={(e) => handleScoreChange(key, e.target.value)}
                    required
                    style={{ width: '80px' }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={scores[key]}
                    onChange={(e) => handleScoreChange(key, e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            ))}
            
            <div className="total-score-display">
              <strong>Total Score: {getTotalScore()}/100</strong>
            </div>
          </div>

          <div className="form-group">
            <label>Remarks (Optional)</label>
            <textarea
              className="input"
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks for the team..."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Evaluation'}
          </button>
        </form>
      </div>
    );
  }

  if (showScanner || showManual) {
    return (
      <div className="qr-scanner-container animate-fade-in">
        {showManual ? (
          <div>
            <button className="btn btn-secondary" style={{ marginBottom: 16 }} onClick={() => setShowManual(false)}>
              Back
            </button>
            
            <div className="card animate-fade-in-up">
              <h3 style={{ marginBottom: 16 }}>Select Team Manually</h3>
              <div className="form-group">
                <label>Choose a Team</label>
                <select 
                  className="input" 
                  value={selectedTeamId}
                  onChange={handleTeamSelect}
                  required
                >
                  <option value="">-- Select Team --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.team_name} - {t.team_leader}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div id="qr-reader"></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => {
                if (html5QrcodeScanner.current) {
                  html5QrcodeScanner.current.clear().catch(() => {});
                }
                setShowScanner(false);
              }}>
                Cancel
              </button>
              <button className="btn btn-secondary" onClick={handleManualEntry}>
                Manual Entry
              </button>
            </div>
          </div>
        )}
        {scannerError && <div className="error-message">{scannerError}</div>}
      </div>
    );
  }

  return (
    <div className="landing-container">
      <p className="landing-welcome">Welcome Judge</p>
      <h1 className="landing-title">Hacknation</h1>
      <p className="landing-year">2026</p>
      
      <div className="landing-buttons">
        <button className="btn landing-btn-primary" onClick={startScanner}>
          Scan QR Code
        </button>
        <button className="btn landing-btn-secondary" onClick={handleManualEntry}>
          Manual Entry
        </button>
      </div>
    </div>
  );
}
