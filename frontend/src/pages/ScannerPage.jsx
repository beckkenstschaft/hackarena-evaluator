import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { getTeam, getTeams, getJudges, submitEvaluation, getEvaluationByTeam, getEvaluationCount, getEvaluatedTeams, scanQR, getTeamQRStatus } from '../utils/api';

const CRITERIA = [
  { key: 'novelty', label: 'Novelty', max: 20 },
  { key: 'usage_score', label: 'Usage', max: 20 },
  { key: 'methodology', label: 'Methodology', max: 20 },
  { key: 'presentation', label: 'Presentation', max: 20 },
  { key: 'uniqueness', label: 'Uniqueness', max: 20 }
];

export default function ScannerPage() {
  const { teamId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [cameraStarting, setCameraStarting] = useState(false);
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
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundLimitReached, setRoundLimitReached] = useState(false);
  const [scannedJudgeId, setScannedJudgeId] = useState(null);
  const [qrInvalid, setQrInvalid] = useState(false);
  const html5QrcodeScanner = useRef(null);

  useEffect(() => {
    const qrParam = searchParams.get('qr');
    if (qrParam) {
      handleQRScan(qrParam);
    } else if (teamId) {
      loadTeam(teamId);
    }
    loadJudges();
    loadTeams();
  }, [teamId, searchParams]);

  useEffect(() => {
    return () => {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.stop().catch(() => {});
        html5QrcodeScanner.current.clear().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (showScanner) {
      const startCamera = async () => {
        try {
          if (html5QrcodeScanner.current) {
            try {
              await html5QrcodeScanner.current.stop();
            } catch (e) {}
          }
          
          html5QrcodeScanner.current = new Html5Qrcode('qr-reader');
          
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          };
          
          await html5QrcodeScanner.current.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              let qrId;
              try {
                const url = new URL(decodedText);
                qrId = url.searchParams.get('qr');
              } catch {
                qrId = decodedText.includes('qr=') ? decodedText.split('qr=')[1]?.split('&')[0] : null;
              }
              
              if (qrId) {
                html5QrcodeScanner.current.stop().catch(() => {});
                setShowScanner(false);
                handleQRScan(qrId);
              } else {
                setScannerError('Invalid QR code format');
              }
            },
            (err) => {
              console.log('Scan error:', err);
            }
          );
          
          setCameraStarting(false);
        } catch (err) {
          console.error('Scanner error:', err);
          setScannerError('Unable to start camera: ' + (err.message || String(err)));
          setShowScanner(false);
          setShowManual(true);
          setCameraStarting(false);
        }
      };
      
      const timer = setTimeout(startCamera, 100);
      return () => clearTimeout(timer);
    } else {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.stop().catch(() => {});
      }
    }
  }, [showScanner]);

  const handleQRScan = async (qrId) => {
    try {
      setLoading(true);
      setScannedJudgeId(null);
      
      const result = await scanQR(qrId, 'pending');
      
      if (!result.success) {
        setQrInvalid(true);
        setError('Invalid or discontinued QR code');
        return;
      }

      setTeam(result.team);
      
      const qrStatus = await getTeamQRStatus(result.team.id);
      const latestScan = qrStatus.find(q => q.id === qrId);
      
      if (latestScan?.scanned_by_judge_id) {
        setScannedJudgeId(latestScan.scanned_by_judge_id);
        setSelectedJudge(latestScan.scanned_by_judge_id);
      }
      
      const existingEval = await getEvaluationByTeam(result.team.id);
      if (existingEval && existingEval.length > 0) {
        setAlreadyEvaluated(existingEval[0]);
      }
      
    } catch (err) {
      if (err.message.includes('discontinued')) {
        setQrInvalid(true);
        setError('This QR code has been discontinued. Please use a new QR code.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

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
    setQrInvalid(false);
    setCameraStarting(true);
  };

  const handleManualEntry = () => {
    setShowManual(true);
    setShowScanner(false);
    setScannerError('');
    setQrInvalid(false);
    setScannedJudgeId(null);
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
    setScannedJudgeId(null);
    setQrInvalid(false);
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
    setError('');
    navigate('/scan');
  };

  const handleScoreChange = (criterion, value) => {
    if (value === '') {
      setScores(prev => ({ ...prev, [criterion]: 0 }));
      return;
    }
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.min(20, Math.max(0, Math.round(numValue * 10) / 10));
    setScores(prev => ({ ...prev, [criterion]: clampedValue }));
  };

  const handleScoreFocus = (criterion) => {
    setScores(prev => ({ ...prev, [criterion]: '' }));
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

  if (loading && !team && (teamId || searchParams.get('qr'))) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (qrInvalid) {
    return (
      <div className="landing-container">
        <div className="card animate-fade-in-up" style={{ maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 style={{ marginBottom: 8 }}>Invalid QR Code</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error}</p>
          <button className="btn btn-primary" onClick={resetForm}>
            Scan New QR
          </button>
        </div>
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
                <label>{label}</label>
                <input
                  type="number"
                  className="input"
                  value={scores[key]}
                  readOnly
                  style={{ width: '100px' }}
                />
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
                <label>{label}</label>
                <input
                  type="number"
                  className="input"
                  value={alreadyEvaluated[key]}
                  readOnly
                  style={{ width: '100px' }}
                />
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
            {scannedJudgeId && (
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--success)' }}>
                Your QR has been scanned
              </p>
            )}
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
            <h3 style={{ marginBottom: 20 }}>Criteria Scores (0-20 each, decimals allowed)</h3>
            <div className="scores-grid">
              {CRITERIA.map(({ key, label }) => (
                <div key={key} className="score-input-group">
                  <label>{label}</label>
                  <input
                    type="number"
                    className="input score-input"
                    min="0"
                    max="20"
                    step="0.1"
                    value={scores[key]}
                    onChange={(e) => handleScoreChange(key, e.target.value)}
                    onFocus={() => handleScoreFocus(key)}
                    placeholder="0"
                    required
                  />
                </div>
              ))}
            </div>
            
            <div className="total-score-display" style={{ marginTop: 24 }}>
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
      <div className="animate-fade-in" style={{ maxWidth: 500, margin: '0 auto' }}>
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
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Scan QR Code</h3>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  if (html5QrcodeScanner.current) {
                    html5QrcodeScanner.current.stop().catch(() => {});
                  }
                  setShowScanner(false);
                }}
              >
                Cancel
              </button>
            </div>
            
            {cameraStarting && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Starting camera...</p>
              </div>
            )}
            
            <div id="qr-reader" style={{ display: cameraStarting ? 'none' : 'block' }}></div>
            
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleManualEntry}>
                Switch to Manual Entry
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

      <style>{`
        .scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }
        
        .score-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .score-input {
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          padding: 16px;
        }
        
        .score-input::-webkit-inner-spin-button,
        .score-input::-webkit-outer-spin-button {
          opacity: 1;
        }
        
        #qr-reader video {
          border-radius: var(--radius);
          width: 100%;
        }
        
        #qr-reader__scan_region {
          background: transparent;
        }
        
        #qr-reader__dashboard {
          display: none;
        }
        
        #qr-reader__dashboard_section_swaplink {
          display: none;
        }
      `}</style>
    </div>
  );
}
