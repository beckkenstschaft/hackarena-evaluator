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

  const getTeamById = (id) => teams.find(t => t.id === id);

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
          className={`tab ${activeTab === 'scans' ? 'active' : ''}`}
          onClick={() => setActiveTab('scans')}
        >
          Scan History
        </button>
        <button 
          className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr')}
        >
          QR Management
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
                    <div key={judge.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: 14
                        }}>
                          {judge.name.charAt(0).toUpperCase()}
                        </div>
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
                    <div key={stat.round_number} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <span>Round {stat.round_number}</span>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{stat.teams_evaluated} teams</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Avg: {Math.round(stat.avg_score) || '-'}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Max: {stat.max_score || '-'}</span>
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
                    <th>Time</th>
                    <th>Judge</th>
                    <th>Team</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scanActivity.slice(0, 10).map((scan, index) => (
                    <tr key={scan.id || index}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {scan.evaluated_at ? new Date(scan.evaluated_at).toLocaleString() : '-'}
                      </td>
                      <td>{scan.judge_name || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                      <td>{scan.team_name || getTeamById(scan.team_id)?.team_name}</td>
                      <td>
                        {scan.total_score ? (
                          <span className="score-badge score-high">{scan.total_score}/100</span>
                        ) : (
                          <span className="score-badge score-medium">Pending</span>
                        )}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: 14
                          }}>
                            {judge.name.charAt(0).toUpperCase()}
                          </div>
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

      {activeTab === 'scans' && (
        <div className="animate-fade-in">
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>QR Scan & Evaluation Activity</h3>
            {scanActivity.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Judge</th>
                    <th>Team</th>
                    <th>Leader</th>
                    <th>Scored</th>
                  </tr>
                </thead>
                <tbody>
                  {scanActivity.map((scan, index) => (
                    <tr key={scan.id || index} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.03}s` }}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                        {scan.evaluated_at ? new Date(scan.evaluated_at).toLocaleString() : scan.scan_time ? new Date(scan.scan_time).toLocaleString() : '-'}
                      </td>
                      <td>{scan.judge_name || <span style={{ color: 'var(--text-muted)' }}>Not scanned</span>}</td>
                      <td>
                        <strong>{scan.team_name || getTeamById(scan.team_id)?.team_name}</strong>
                      </td>
                      <td>{scan.team_leader || getTeamById(scan.team_id)?.team_leader}</td>
                      <td>
                        {scan.total_score ? (
                          <span className="score-badge score-high">{scan.total_score}/100</span>
                        ) : (
                          <span className="score-badge score-medium">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No scan activity yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'qr' && (
        <div className="animate-fade-in">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
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
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Leader</th>
                      <th>QR Status</th>
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
                            <span className="score-badge score-medium">Not Generated</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {team.current_qr_id ? (
                              <>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={() => viewTeamQR(team)}
                                  style={{ padding: '6px 10px', fontSize: 11 }}
                                >
                                  View QR
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={() => viewQRHistory(team.id)}
                                  style={{ padding: '6px 10px', fontSize: 11 }}
                                >
                                  History
                                </button>
                                <button 
                                  className="btn btn-primary" 
                                  onClick={() => handleRegenerateQR(team.id)}
                                  style={{ padding: '6px 10px', fontSize: 11 }}
                                >
                                  Regenerate
                                </button>
                              </>
                            ) : (
                              <button 
                                className="btn btn-primary" 
                                onClick={() => handleGenerateQR(team.id)}
                                style={{ padding: '6px 10px', fontSize: 11 }}
                              >
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setShowQRModal(null)}>
          <div className="card animate-scale-in" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{showQRModal.team_name}</h3>
            <p style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: 14 }}>Team QR Code</p>
            <div style={{ 
              background: 'white', 
              padding: 20, 
              borderRadius: 12, 
              display: 'inline-block',
              marginBottom: 20
            }}>
              <QRCodeDisplay value={`${window.location.origin}/scan?qr=${showQRModal.current_qr_id}`} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Scan this code to evaluate {showQRModal.team_name}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={downloadQR}>
                Download QR
              </button>
              <button className="btn btn-secondary" onClick={() => setShowQRModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTeam && qrStatus && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => { setSelectedTeam(null); setQRStatus(null); }}>
          <div className="card animate-scale-in" style={{ maxWidth: 500, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>QR Code History</h3>
              <button 
                onClick={() => { setSelectedTeam(null); setQRStatus(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
              >
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
                  <th>Scan Time</th>
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
                    <td>{qr.scan_time ? new Date(qr.scan_time).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      QRCode.toDataURL(value, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      }).then(setQrUrl);
    });
  }, [value]);

  if (!qrUrl) {
    return <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200 }} />;
}
