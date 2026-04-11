import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiSend, FiCheckCircle, FiClock } from 'react-icons/fi';
import { teamAPI, evaluationAPI, adminAPI } from '../utils/api';

const criteria = [
  { key: 'innovation', label: 'Innovation', weight: 40, icon: '💡', description: 'Creativity, uniqueness, problem-solving' },
  { key: 'technical', label: 'Technical', weight: 30, icon: '⚙️', description: 'Code quality, functionality, tech stack' },
  { key: 'uiux', label: 'UI/UX', weight: 20, icon: '🎨', description: 'Design, user experience, accessibility' },
  { key: 'presentation', label: 'Presentation', weight: 10, icon: '🎤', description: 'Clarity, confidence, demo' },
];

export default function Evaluation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [team, setTeam] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [scores, setScores] = useState({
    innovation: 5,
    technical: 5,
    uiux: 5,
    presentation: 5
  });
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('waitlist');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const teamId = searchParams.get('team');
    if (!teamId) {
      navigate('/scanner');
      return;
    }

    try {
      setError('');
      
      const teamRes = await teamAPI.getById(teamId);
      setTeam(teamRes.data.data);
      
      const roundsRes = await adminAPI.getRounds({}).catch(() => ({ data: { data: [] } }));
      const roundsData = roundsRes.data.data || [];
      setRounds(roundsData);

      if (roundsData.length > 0) {
        const activeRound = roundsData.find(r => r.isActive) || roundsData[0];
        setSelectedRound(activeRound._id);
        
        const existingEvalRes = await evaluationAPI.getJudge({ roundId: activeRound._id }).catch(() => ({ data: { data: [] } }));
        const existingEvals = existingEvalRes.data.data || [];
        const existingEval = existingEvals.find(e => e.team?._id === teamId);
        
        if (existingEval) {
          setScores(existingEval.scores);
          setComments(existingEval.comments || '');
          setRecommendation(existingEval.recommendation);
          setSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load evaluation data';
      setError(errorMessage);
      if (err.response?.status === 404) {
        setError('Team not found. Please scan a valid QR code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (key, value) => {
    setScores(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const getTotalScore = () => {
    return scores.innovation + scores.technical + scores.uiux + scores.presentation;
  };

  const getWeightedScore = () => {
    return (
      scores.innovation * 0.4 +
      scores.technical * 0.3 +
      scores.uiux * 0.2 +
      scores.presentation * 0.1
    ).toFixed(1);
  };

  const handleSubmit = async () => {
    if (!selectedRound) {
      setError('Please select a round');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await evaluationAPI.submit({
        teamId: team._id,
        roundId: selectedRound,
        scores,
        comments,
        recommendation
      });

      setSubmitted(true);
      setTimeout(() => navigate('/leaderboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error || 'Team not found'}</p>
        <button onClick={() => navigate('/scanner')} className="btn-primary">
          Go to Scanner
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Team Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{team.teamName}</h1>
            <p className="text-zinc-400">{team.projectTitle}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                {team.track}
              </span>
              <span className="text-xs text-zinc-500">
                {team.members?.length || 0} members
              </span>
            </div>
          </div>
          
          {submitted && (
            <div className="flex items-center gap-2 text-green-400">
              <FiCheckCircle />
              <span className="text-sm">Evaluated</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Round Selection */}
      <div className="card">
        <label className="block text-sm font-medium mb-2 text-zinc-400">Select Round</label>
        <select
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
          className="input-field"
        >
          {rounds.map(round => (
            <option key={round._id} value={round._id}>
              {round.name} {round.isActive && '(Active)'}
            </option>
          ))}
        </select>
      </div>

      {/* Scores */}
      <div className="space-y-4">
        {criteria.map((criterion, idx) => (
          <motion.div
            key={criterion.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{criterion.icon}</span>
                <div>
                  <h3 className="font-semibold">{criterion.label}</h3>
                  <p className="text-xs text-zinc-500">{criterion.description}</p>
                </div>
              </div>
              <span className="text-2xl font-bold gradient-text">
                {scores[criterion.key]}/10
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="10"
              value={scores[criterion.key]}
              onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
              className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>0 - Poor</span>
              <span>10 - Excellent</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Total Score</p>
            <p className="text-xs text-zinc-500">Weighted: {getWeightedScore()}/4</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold gradient-text">{getTotalScore()}/40</p>
          </div>
        </div>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-400">Comments (optional)</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide feedback..."
            className="input-field min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-400">Recommendation</label>
          <div className="grid grid-cols-3 gap-3">
            {['qualify', 'waitlist', 'reject'].map(rec => (
              <button
                key={rec}
                onClick={() => setRecommendation(rec)}
                className={`p-3 rounded-xl border transition text-center ${
                  recommendation === rec
                    ? rec === 'qualify' ? 'border-green-500 bg-green-500/10 text-green-400' :
                    rec === 'waitlist' ? 'border-amber-500 bg-amber-500/10 text-amber-400' :
                    'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-dark-700 hover:border-dark-600'
                }`}
              >
                {rec.charAt(0).toUpperCase() + rec.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || submitted}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : submitted ? (
            <>
              <FiCheckCircle />
              Submitted!
            </>
          ) : (
            <>
              <FiSend />
              Submit Evaluation
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}