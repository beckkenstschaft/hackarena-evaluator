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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Judges</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Judge'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Add New Judge</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Judge Name *</label>
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
          {judges.map(judge => (
            <div key={judge.id} className="team-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{judge.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Added: {new Date(judge.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button className="btn btn-danger" onClick={() => handleDelete(judge.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}