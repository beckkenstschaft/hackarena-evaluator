import { useState, useEffect } from 'react';
import { getAdminStats, getJudgeStats, getScanActivity, getTeams, regenerateTeamQR, getTeamQRStatus, generateTeamQR } from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [judgeStats, setJudgeStats] = useState([]);
  const [scanActivity, setScanActivity] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [qrStatus, setQRStatus] = useState(null);
  const [showQRModal, setShowQRModal] = useState(null);
  const [teamSearch, setTeamSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, judgeData, activityData, teamsData] = await Promise.all([
        getAdminStats(),
        getJudgeStats(),
        getScanActivity(),
        getTeams()
      ]);
      setStats(statsData);
      setJudgeStats(judgeData);
      setScanActivity(activityData);
      setTeams(teamsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (teamId) => {
    try {
      await generateTeamQR(teamId, window.location.origin);
      alert('QR code generated successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegenerateQR = async (teamId) => {
    if (!confirm('This will deactivate the current QR code and generate a new one. Continue?')) return;
    try {
      await regenerateTeamQR(teamId, window.location.origin);
      alert('QR code regenerated successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const viewQRHistory = async (teamId) => {
    try {
      const status = await getTeamQRStatus(teamId);
      setSelectedTeam(teamId);
      setQRStatus(status);
    } catch (err) {
      console.error(err);
    }
  };

  const viewTeamQR = async (team) => {
    if (!team.current_qr_id) {
      alert('No QR code generated for this team');
      return;
    }
    setShowQRModal(team);
  };

  const downloadQR = async () => {
    if (!showQRModal?.current_qr_id) return;
    try {
      const { default: QRCode } = await import('qrcode');
      const qrUrl = await QRCode.toDataURL(`${window.location.origin}/scan?qr=${showQRModal.current_qr_id}`, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      const link = document.createElement('a');
      link.download = `${showQRModal.team_name.replace(/\s+/g, '_')}_QR.png`;
      link.href = qrUrl;
      link.click();
    } catch (err) {
      alert('Failed to download QR code');
    }
  };

  const filteredTeams = teams.filter(t => 
    t.team_name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    t.team_leader.toLowerCase().includes(teamSearch.toLowerCase())
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
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'judges' ? 'active' : ''}`}
          onClick={() => setActiveTab('judges')}
        >
          Judge Activity
        </button>
        <button 
          className={`tab ${activeTab === 'evaluations' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluations')}
        >
          Evaluations
        </button>
        <button 
          className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr')}
        >
          QR Codes
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div className="grid grid-4" style={{ marginBottom: 32 }}>
            <div className="stat-card animate-fade-in-up">
              <div className="stat-value">{stats?.totalTeams || 0}</div>
              <div className="stat-label">Total Teams</div>
            </div>
            <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="stat-value">{stats?.totalJudges || 0}</div>
              <div className="stat-label">Total Judges</div>
            </div>
            <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="stat-value">{stats?.totalEvaluations || 0}</div>
              <div className="stat-label">Evaluations</div>
            </div>
            <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.currentRound || 1}</div>
              <div className="stat-label">Current Round</div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginBottom: 32 }}>
            <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 style={{ marginBottom: 16 }}>Judge Performance</h3>
              {judgeStats.length > 0 ? (
                <div>
                  {judgeStats.map(judge => (
                    <div key={judge.id} className="judge-row">
                      <div className="judge-info">
                        <div className="judge-avatar">{judge.name.charAt(0).toUpperCase()}</div>
                        <span>{judge.name}</span>
                      </div>
                      <span className={`score-badge ${judge.evaluations_count > 0 ? 'score-high' : 'score-medium'}`}>
                        {judge.evaluations_count} evals
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No judges yet</p>
              )}
            </div>

            <div className="card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h3 style={{ marginBottom: 16 }}>Round Statistics</h3>
              {stats?.roundStats?.length > 0 ? (
                <div>
                  {stats.roundStats.map(stat => (
                    <div key={stat.round_number} className="round-row">
                      <span>Round {stat.round_number}</span>
                      <div className="round-stats">
                        <span>{stat.teams_evaluated} teams</span>
                        <span>Avg: {Math.round(stat.avg_score) || '-'}</span>
                        <span>Max: {stat.max_score || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No evaluations yet</p>
              )}
            </div>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 style={{ marginBottom: 16 }}>Recent Evaluations</h3>
            {scanActivity.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Judge</th>
                    <th>Team</th>
                    <th>Score</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {scanActivity.slice(0, 10).map((scan, index) => (
                    <tr key={scan.id || index}>
                      <td>{scan.judge_name || 'N/A'}</td>
                      <td><strong>{scan.team_name}</strong></td>
                      <td>
                        {scan.total_score ? (
                          <span className="score-badge score-high">{scan.total_score}/100</span>
                        ) : (
                          <span className="score-badge score-medium">Pending</span>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {scan.evaluated_at ? new Date(scan.evaluated_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No evaluations yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'judges' && (
        <div className="animate-fade-in">
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Judge Performance</h3>
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
                      <td>
                        <div className="judge-info">
                          <div className="judge-avatar">{judge.name.charAt(0).toUpperCase()}</div>
                          {judge.name}
                        </div>
                      </td>
                      <td>
                        <span className={`score-badge ${judge.evaluations_count > 0 ? 'score-high' : 'score-medium'}`}>
                          {judge.evaluations_count}
                        </span>
                      </td>
                      <td>Round {judge.last_round}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No judges added yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="animate-fade-in">
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>All Evaluations</h3>
            {scanActivity.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Judge</th>
                    <th>Team</th>
                    <th>Leader</th>
                    <th>Score</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {scanActivity.map((scan, index) => (
                    <tr key={scan.id || index}>
                      <td>{scan.judge_name || 'N/A'}</td>
                      <td><strong>{scan.team_name}</strong></td>
                      <td>{scan.team_leader}</td>
                      <td>
                        {scan.total_score ? (
                          <span className="score-badge score-high">{scan.total_score}/100</span>
                        ) : (
                          <span className="score-badge score-medium">Pending</span>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {scan.evaluated_at ? new Date(scan.evaluated_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No evaluations yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'qr' && (
        <div className="animate-fade-in">
          <div className="card">
            <div className="qr-header">
              <div>
                <h3 style={{ marginBottom: 4 }}>QR Code Management</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  {teams.filter(t => t.current_qr_id).length} of {teams.length} teams have QR codes
                </p>
              </div>
              <input
                type="text"
                className="input"
                placeholder="Search teams..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                style={{ width: 'auto', minWidth: 200 }}
              />
            </div>
            
            {filteredTeams.length > 0 ? (
              <div className="qr-table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Leader</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map(team => (
                      <tr key={team.id}>
                        <td><strong>{team.team_name}</strong></td>
                        <td>{team.team_leader}</td>
                        <td>
                          {team.current_qr_id ? (
                            <span className="score-badge score-high">Active</span>
                          ) : (
                            <span className="score-badge score-medium">Missing</span>
                          )}
                        </td>
                        <td>
                          <div className="qr-actions">
                            {team.current_qr_id ? (
                              <>
                                <button className="btn btn-secondary btn-sm" onClick={() => viewTeamQR(team)}>
                                  View QR
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => viewQRHistory(team.id)}>
                                  History
                                </button>
                                <button className="btn btn-primary btn-sm" onClick={() => handleRegenerateQR(team.id)}>
                                  Regenerate
                                </button>
                              </>
                            ) : (
                              <button className="btn btn-primary btn-sm" onClick={() => handleGenerateQR(team.id)}>
                                Generate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No teams found</p>
            )}
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(null)}>
          <div className="card modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{showQRModal.team_name}</h3>
            <p style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: 14 }}>Team QR Code</p>
            <div className="qr-display">
              <QRCodeDisplay value={`${window.location.origin}/scan?qr=${showQRModal.current_qr_id}`} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
              Scan to evaluate this team
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={downloadQR}>
                Download
              </button>
              <button className="btn btn-secondary" onClick={() => setShowQRModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTeam && qrStatus && (
        <div className="modal-overlay" onClick={() => { setSelectedTeam(null); setQRStatus(null); }}>
          <div className="card modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>QR Code History</h3>
              <button className="close-btn" onClick={() => { setSelectedTeam(null); setQRStatus(null); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>QR ID</th>
                  <th>Status</th>
                  <th>Scanned By</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {qrStatus.map((qr, index) => (
                  <tr key={qr.id || index}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{qr.id?.substring(0, 8)}...</td>
                    <td>
                      {qr.is_active ? (
                        <span className="score-badge score-high">Active</span>
                      ) : (
                        <span className="score-badge score-medium">Discontinued</span>
                      )}
                    </td>
                    <td>{qr.judge_name || '-'}</td>
                    <td style={{ fontSize: 13 }}>{qr.scan_time ? new Date(qr.scan_time).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .judge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .judge-row:last-child { border-bottom: none; }
        .judge-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .judge-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }
        .round-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .round-row:last-child { border-bottom: none; }
        .round-stats {
          display: flex;
          gap: 16px;
          color: var(--text-secondary);
        }
        .qr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .qr-table-container {
          max-height: 60vh;
          overflow-y: auto;
        }
        .qr-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-sm {
          padding: 8px 12px;
          font-size: 12px;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          max-width: 500px;
          width: 90%;
          text-align: center;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-header h3 { margin-bottom: 0; }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--text-secondary);
        }
        .qr-display {
          background: white;
          padding: 20px;
          border-radius: 12px;
          display: inline-block;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}

function QRCodeDisplay({ value }) {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    import('qrcode').then(({ default: QRCode }) => {
      QRCode.toDataURL(value, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      }).then(setQrUrl);
    });
  }, [value]);

  if (!qrUrl) {
    return <div style={{ width: 200, height: 200, background: '#f4f4f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200 }} />;
}
