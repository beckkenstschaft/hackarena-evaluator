import { useState, useEffect } from 'react';
import { getAdminStats, getJudgeStats, getEvaluations, getTeams, regenerateTeamQR, getTeamQRStatus, generateTeamQR, deleteEvaluation } from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [judgeStats, setJudgeStats] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [qrModal, setQrModal] = useState(null);
  const [qrHistory, setQrHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, judgeData, evalData, teamsData] = await Promise.all([
        getAdminStats(),
        getJudgeStats(),
        getEvaluations(),
        getTeams()
      ]);
      setStats(statsData);
      setJudgeStats(judgeData);
      setEvaluations(evalData);
      setTeams(teamsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (teamId) => {
    try {
      await generateTeamQR(teamId, window.location.origin);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegenerateQR = async (teamId) => {
    if (!confirm('This will deactivate the current QR and generate a new one. Continue?')) return;
    try {
      await regenerateTeamQR(teamId, window.location.origin);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const viewQRHistory = async (teamId) => {
    try {
      const status = await getTeamQRStatus(teamId);
      setQrHistory(status);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
    }
  };

  const viewTeamQR = async (team) => {
    setQrModal(team);
  };

  const downloadQR = async () => {
    if (!qrModal?.current_qr_id) return;
    try {
      const { default: QRCode } = await import('qrcode');
      const qrUrl = await QRCode.toDataURL(`${window.location.origin}/scan?qr=${qrModal.current_qr_id}`, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      const link = document.createElement('a');
      link.download = `${qrModal.team_name.replace(/\s+/g, '_')}_QR.png`;
      link.href = qrUrl;
      link.click();
    } catch (err) {
      alert('Failed to download QR');
    }
  };

  const handleDeleteEvaluation = async (evalId) => {
    if (!confirm('⚠️ Are you sure you want to delete this evaluation? This will also remove it from the Excel file. This action cannot be undone.')) return;
    
    try {
      await deleteEvaluation(evalId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.team_name.toLowerCase().includes('') ||
    t.team_leader.toLowerCase().includes('')
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">Admin Dashboard</h2>

      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`tab ${activeTab === 'judges' ? 'active' : ''}`} onClick={() => setActiveTab('judges')}>
          Judges
        </button>
        <button className={`tab ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}>
          Evaluations
        </button>
        <button className={`tab ${activeTab === 'qr' ? 'active' : ''}`} onClick={() => setActiveTab('qr')}>
          QR Codes
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.totalTeams || 0}</div>
              <div className="stat-label">Total Teams</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalJudges || 0}</div>
              <div className="stat-label">Total Judges</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalEvaluations || 0}</div>
              <div className="stat-label">Evaluations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.currentRound || 1}</div>
              <div className="stat-label">Current Round</div>
            </div>
          </div>

          <div className="admin-cards-stack" style={{ marginTop: 24 }}>
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Judge Performance</h3>
              {judgeStats.length > 0 ? (
                judgeStats.map(judge => (
                  <div key={judge.id} className="team-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3>{judge.name}</h3>
                        <p>Evaluations: {judge.evaluations_count}</p>
                      </div>
                      <span className="score-badge score-high">{judge.evaluations_count} evals</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No judges yet</p>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Round Stats</h3>
              {stats?.roundStats?.length > 0 ? (
                stats.roundStats.map(stat => (
                  <div key={stat.round_number} className="team-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <h3>Round {stat.round_number}</h3>
                        <p>{stat.teams_evaluated} teams evaluated</p>
                      </div>
                      <span>Avg: {Math.round(stat.avg_score) || '-'} | Max: {stat.max_score || '-'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No evaluations yet</p>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 24, overflow: 'hidden' }}>
            <h3 style={{ marginBottom: 16 }}>Recent Evaluations</h3>
            {evaluations.length > 0 ? (
              <div className="eval-cards-list">
                {evaluations.slice(0, 10).map(ev => (
                  <div key={ev.id} className="eval-item-card">
                    <div className="eval-item-info">
                      <h4>{ev.team_name}</h4>
                      <p>{ev.judge_name}</p>
                    </div>
                    <div className="eval-item-meta">
                      <span className="score-badge score-high">{ev.total_score}/100</span>
                      <span className="round-badge">Round {ev.round_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No evaluations yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'judges' && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>All Judges</h3>
          {judgeStats.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Judge</th>
                  <th>Evaluations</th>
                  <th>Last Round</th>
                </tr>
              </thead>
              <tbody>
                {judgeStats.map(judge => (
                  <tr key={judge.id}>
                    <td><strong>{judge.name}</strong></td>
                    <td><span className="score-badge score-high">{judge.evaluations_count}</span></td>
                    <td>Round {judge.last_round}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No judges yet</p>
          )}
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>All Evaluations ({evaluations.length})</h3>
          {evaluations.length > 0 ? (
            <div className="admin-qr-list">
              {evaluations.map(ev => (
                <div key={ev.id} className="admin-qr-item">
                  <div className="admin-qr-item-header">
                    <div>
                      <h4>{ev.team_name}</h4>
                      <p>Judge: {ev.judge_name} | Leader: {ev.team_leader}</p>
                    </div>
                    <span className="score-badge score-high">{ev.total_score}/100</span>
                  </div>
                  <div className="admin-qr-actions">
                    <span className="round-badge">Round {ev.round_number}</span>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteEvaluation(ev.id)}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No evaluations yet</p>
          )}
        </div>
      )}

      {activeTab === 'qr' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            {teams.filter(t => t.current_qr_id).length} of {teams.length} teams have QR codes
          </p>
          
          <div className="admin-qr-list">
            {teams.length > 0 ? (
              teams.map(team => (
                <div key={team.id} className="admin-qr-item">
                  <div className="admin-qr-item-header">
                    <div>
                      <h4>{team.team_name}</h4>
                      <p>Leader: {team.team_leader}</p>
                    </div>
                    {team.current_qr_id ? (
                      <span className="score-badge score-high">Active</span>
                    ) : (
                      <span className="score-badge score-medium">Missing</span>
                    )}
                  </div>
                  <div className="admin-qr-actions">
                    {team.current_qr_id ? (
                      <>
                        <button className="btn btn-secondary" onClick={() => viewTeamQR(team)}>View QR</button>
                        <button className="btn btn-secondary" onClick={() => viewQRHistory(team.id)}>History</button>
                        <button className="btn btn-primary" onClick={() => handleRegenerateQR(team.id)}>Regenerate</button>
                      </>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleGenerateQR(team.id)}>Generate</button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No teams yet</p>
            )}
          </div>
        </div>
      )}

      {qrModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }} onClick={() => setQrModal(null)}>
          <div className="card" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{qrModal.team_name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Scan to evaluate</p>
            <div style={{ background: 'white', padding: 20, borderRadius: 12, display: 'inline-block', marginBottom: 20 }}>
              <QRCodeDisplay value={`${window.location.origin}/scan?qr=${qrModal.current_qr_id}`} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={downloadQR}>Download</button>
              <button className="btn btn-secondary" onClick={() => setQrModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowHistory(false)}>
          <div className="card" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>QR History</h3>
              <button className="btn btn-secondary" onClick={() => setShowHistory(false)}>Close</button>
            </div>
            {qrHistory.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>QR ID</th>
                    <th>Status</th>
                    <th>Scanned By</th>
                  </tr>
                </thead>
                <tbody>
                  {qrHistory.map((qr, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{qr.id?.substring(0, 8)}...</td>
                      <td>
                        {qr.is_active ? (
                          <span className="score-badge score-high">Active</span>
                        ) : (
                          <span className="score-badge score-medium">Discontinued</span>
                        )}
                      </td>
                      <td>{qr.judge_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No history</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QRCodeDisplay({ value }) {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    import('qrcode').then(({ default: QRCode }) => {
      QRCode.toDataURL(value, { width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
        .then(setQrUrl);
    });
  }, [value]);

  if (!qrUrl) return <div style={{ width: 200, height: 200, background: '#f4f4f5', borderRadius: 8 }} />;
  return <img src={qrUrl} alt="QR" style={{ width: 200, height: 200 }} />;
}
