import { useState, useEffect } from 'react';
import { getAdminStats, getJudgeStats, getScanActivity, getTeams, regenerateTeamQR, getTeamQRStatus } from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [judgeStats, setJudgeStats] = useState([]);
  const [scanActivity, setScanActivity] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [qrStatus, setQRStatus] = useState(null);

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

          <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 style={{ marginBottom: 20 }}>Round Statistics</h3>
            {stats?.roundStats?.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Teams Evaluated</th>
                    <th>Avg Score</th>
                    <th>Highest Score</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.roundStats.map(stat => (
                    <tr key={stat.round_number}>
                      <td>Round {stat.round_number}</td>
                      <td>{stat.teams_evaluated}</td>
                      <td>{stat.avg_score ? Math.round(stat.avg_score) : '-'}</td>
                      <td>{stat.max_score || '-'}</td>
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
            <h3 style={{ marginBottom: 20 }}>QR Scan Activity</h3>
            {scanActivity.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Judge</th>
                    <th>Team</th>
                    <th>Scored</th>
                  </tr>
                </thead>
                <tbody>
                  {scanActivity.map((scan, index) => (
                    <tr key={scan.id || index} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.03}s` }}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {scan.scan_time ? new Date(scan.scan_time).toLocaleString() : '-'}
                      </td>
                      <td>{scan.judge_name || <span style={{ color: 'var(--text-muted)' }}>Not scanned</span>}</td>
                      <td>
                        <strong>{scan.team_name}</strong>
                        <br />
                        <small style={{ color: 'var(--text-muted)' }}>{scan.team_leader}</small>
                      </td>
                      <td>
                        {scan.evaluation_id ? (
                          <span className="score-badge score-high">
                            {scan.total_score}/100
                          </span>
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
            <h3 style={{ marginBottom: 20 }}>QR Code Management</h3>
            <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>
              Each team has a unique QR code. If a QR needs regeneration, the old one will be discontinued.
            </p>
            {teams.length > 0 ? (
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
                  {teams.map(team => (
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
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => viewQRHistory(team.id)}
                            style={{ padding: '8px 12px', fontSize: 12 }}
                          >
                            History
                          </button>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleRegenerateQR(team.id)}
                            style={{ padding: '8px 12px', fontSize: 12 }}
                          >
                            Regenerate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No teams added yet</p>
            )}
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

      <style>{`
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .tab {
          padding: 12px 20px;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
          font-family: inherit;
        }
        
        .tab:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        
        .tab.active {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
}
