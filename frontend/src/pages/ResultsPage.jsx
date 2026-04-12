import { useState, useEffect } from 'react';
import { getEvaluationsByRound, getEvaluations } from '../utils/api';

export default function ResultsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvaluations();
  }, [round]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await getEvaluationsByRound(round);
      setEvaluations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const getRankClass = (index) => {
    if (index === 0) return 'rank-1';
    if (index === 1) return 'rank-2';
    if (index === 2) return 'rank-3';
    return 'rank-default';
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
        <h2 className="page-title" style={{ marginBottom: 0 }}>Round {round} Results</h2>
        <select 
          className="input" 
          value={round}
          onChange={(e) => setRound(parseInt(e.target.value))}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value={1}>Round 1</option>
          <option value={2}>Round 2</option>
          <option value={3}>Round 3</option>
        </select>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      {evaluations.length > 0 && (
        <div className="grid grid-3" style={{ marginBottom: 32 }}>
          <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <div className="stat-value">{evaluations.length}</div>
            <div className="stat-label">Teams Evaluated</div>
          </div>
          <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-value">
              {Math.round(evaluations.reduce((sum, e) => sum + e.total_score, 0) / evaluations.length)}
            </div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {Math.max(...evaluations.map(e => e.total_score))}
            </div>
            <div className="stat-label">Highest Score</div>
          </div>
        </div>
      )}

      {evaluations.length === 0 ? (
        <div className="empty-state">
          <h3>No evaluations yet</h3>
          <p>Evaluations for Round {round} will appear here</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Rank</th>
                <th>Team</th>
                <th>Leader</th>
                <th>Novelty</th>
                <th>Usage</th>
                <th>Method</th>
                <th>Present</th>
                <th>Unique</th>
                <th>Total</th>
                <th>Judge</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((eval_, index) => (
                <tr key={eval_.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td>
                    <span className={`rank-badge ${getRankClass(index)}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td><strong>{eval_.team_name}</strong></td>
                  <td>{eval_.team_leader}</td>
                  <td>{eval_.novelty}</td>
                  <td>{eval_.usage_score}</td>
                  <td>{eval_.methodology}</td>
                  <td>{eval_.presentation}</td>
                  <td>{eval_.uniqueness}</td>
                  <td>
                    <span className={`score-badge ${getScoreClass(eval_.total_score)}`}>
                      {eval_.total_score}/100
                    </span>
                  </td>
                  <td>{eval_.judge_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
