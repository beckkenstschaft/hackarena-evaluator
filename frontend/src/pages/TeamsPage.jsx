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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Teams</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Team'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Add New Team</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Team Name *</label>
              <input
                type="text"
                className="input"
                name="teamName"
                value={formData.teamName}
                onChange={handleInputChange}
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
                required
              />
            </div>
            <div className="form-group">
              <label>Team Details</label>
              <textarea
                className="input"
                name="teamDetails"
                value={formData.teamDetails}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
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
              />
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
            <div key={team.id} className="team-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>{team.team_name}</h3>
                  <p><strong>Leader:</strong> {team.team_leader}</p>
                  {team.team_details && <p><strong>Details:</strong> {team.team_details}</p>}
                  {team.team_members && <p><strong>Members:</strong> {team.team_members}</p>}
                  {team.contact_email && <p><strong>Email:</strong> {team.contact_email}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => viewQR(team.id)}>
                    View QR
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(team.id)}>
                    Delete
                  </button>
                </div>
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
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowQR(null)}>
          <div className="card" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>{showQR.teamName}</h3>
            <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>Scan this QR code to evaluate</p>
            <img src={showQR.qrCode} alt="Team QR Code" style={{ maxWidth: '100%', borderRadius: 8 }} />
            <br />
            <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setShowQR(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}