import { useState, useEffect } from 'react';
import { getJudges, createJudge, deleteJudge } from '../utils/api';

export default function JudgesPage() {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadJudges();
  }, []);

  const loadJudges = async () => {
    try {
      setLoading(true);
      const data = await getJudges();
      setJudges(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newJudgeName.trim()) {
      setError('Judge name is required');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await createJudge(newJudgeName.trim());
      setSuccess('Judge added successfully!');
      setNewJudgeName('');
      setShowForm(false);
      loadJudges();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this judge?')) return;
    
    try {
      await deleteJudge(id);
      loadJudges();
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
        <h2 className="page-title" style={{ marginBottom: 0 }}>Judges</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Judge'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="card animate-fade-in-up" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 20 }}>Add New Judge</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Judge Name</label>
              <input
                type="text"
                className="input"
                value={newJudgeName}
                onChange={(e) => setNewJudgeName(e.target.value)}
                placeholder="Enter judge's full name"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Add Judge</button>
          </form>
        </div>
      )}

      {judges.length === 0 ? (
        <div className="empty-state">
          <h3>No judges yet</h3>
          <p>Add judges who will evaluate teams</p>
        </div>
      ) : (
        <div>
          {judges.map((judge, index) => (
            <div key={judge.id} className="item-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16
                }}>
                  {judge.name.charAt(0).toUpperCase()}
                </div>
                <div className="item-info">
                  <h3>{judge.name}</h3>
                  <p>Added {new Date(judge.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button className="action-btn delete" onClick={() => handleDelete(judge.id)} title="Remove">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
