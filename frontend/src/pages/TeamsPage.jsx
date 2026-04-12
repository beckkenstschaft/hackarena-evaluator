import { useState, useEffect } from 'react';
import { getTeams, createTeam, deleteTeam, getTeamQRCode } from '../utils/api';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeader: '',
    teamDetails: '',
    teamMembers: '',
    contactEmail: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamName || !formData.teamLeader) {
      setError('Team name and team leader are required');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await createTeam(formData);
      setSuccess('Team created successfully!');
      setFormData({ teamName: '', teamLeader: '', teamDetails: '', teamMembers: '', contactEmail: '' });
      setShowForm(false);
      loadTeams();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await deleteTeam(id);
      loadTeams();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewQR = async (teamId) => {
    try {
      const data = await getTeamQRCode(teamId);
      setShowQR(data);
    } catch (err) {
      setError(err.message);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Teams</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Team'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="card animate-fade-in-up" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 20 }}>Add New Team</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  className="input"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Team Leader *</label>
                <input
                  type="text"
                  className="input"
                  name="teamLeader"
                  value={formData.teamLeader}
                  onChange={handleInputChange}
                  placeholder="Leader name"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Team Details</label>
              <textarea
                className="input"
                name="teamDetails"
                value={formData.teamDetails}
                onChange={handleInputChange}
                rows="2"
                placeholder="Brief description of the project"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Team Members</label>
                <input
                  type="text"
                  className="input"
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleInputChange}
                  placeholder="Comma separated names"
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  className="input"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="team@email.com"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Team</button>
          </form>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="empty-state">
          <h3>No teams yet</h3>
          <p>Add your first team to get started</p>
        </div>
      ) : (
        <div>
          {teams.map(team => (
            <div key={team.id} className="item-card">
              <div className="item-info">
                <h3>{team.team_name}</h3>
                <p>Led by {team.team_leader}</p>
              </div>
              <div className="action-btns">
                <button className="action-btn" onClick={() => viewQR(team.id)} title="View QR">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button className="action-btn delete" onClick={() => handleDelete(team.id)} title="Delete">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showQR && (
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
        }} onClick={() => setShowQR(null)}>
          <div className="card animate-scale-in" style={{ maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4 }}>{showQR.teamName}</h3>
            <p style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: 14 }}>Scan to evaluate</p>
            <img src={showQR.qrCode} alt="Team QR Code" style={{ width: 200, height: 200, borderRadius: 12 }} />
            <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={() => setShowQR(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
