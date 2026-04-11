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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">Round {round} Results</h2>
      
      {error && <div className="error-message">{error}</div>}

      {evaluations.length === 0 ? (
        <div className="empty-state">
          <h3>No evaluations yet</h3>
          <p>Evaluations for Round {round} will appear here after judges submit scores</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Leader</th>
                <th>Novelty</th>
                <th>Usage</th>
                <th>Methodology</th>
                <th>Presentation</th>
                <th>Unique</th>
                <th>Total</th>
                <th>Judge</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((eval_, index) => (
                <tr key={eval_.id}>
                  <td>
                    <span className={`score-badge ${index === 0 ? 'score-high' : ''}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td><strong>{eval_.team_name}</strong></td>
                  <td>{eval_.team_leader}</td>
                  <td>{eval_.novelty}/20</td>
                  <td>{eval_.usage_score}/20</td>
                  <td>{eval_.methodology}/20</td>
                  <td>{eval_.presentation}/20</td>
                  <td>{eval_.uniqueness}/20</td>
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

      {evaluations.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Summary</h3>
          <div className="grid grid-3">
            <div className="card">
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Total Teams Evaluated</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{evaluations.length}</p>
            </div>
            <div className="card">
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Average Score</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>
                {Math.round(evaluations.reduce((sum, e) => sum + e.total_score, 0) / evaluations.length)}
              </p>
            </div>
            <div className="card">
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Highest Score</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>
                {Math.max(...evaluations.map(e => e.total_score))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}