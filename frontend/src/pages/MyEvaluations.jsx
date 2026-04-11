import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiAward, FiUser } from 'react-icons/fi';
import { evaluationAPI } from '../utils/api';

export default function MyEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await evaluationAPI.getJudge({});
      setEvaluations(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FiClock className="text-primary-400" />
          My Evaluations
        </h1>
        <p className="text-zinc-500 mt-1">{evaluations.length} total evaluations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : evaluations.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          No evaluations yet
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((eval_, idx) => (
            <motion.div
              key={eval_._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {eval_?.team?.teamName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{eval_?.team?.teamName || 'Team'}</h3>
                    <p className="text-sm text-zinc-500">{eval_?.team?.projectTitle}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <FiAward size={12} />
                        {eval_?.round?.name || 'Round'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar size={12} />
                        {new Date(eval_.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">{eval_.totalScore}</p>
                    <p className="text-xs text-zinc-500">/40</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    eval_.recommendation === 'qualify' ? 'bg-green-500/20 text-green-400' :
                    eval_.recommendation === 'waitlist' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {eval_.recommendation}
                  </span>
                </div>
              </div>
              
              {eval_.comments && (
                <div className="mt-3 pt-3 border-t border-dark-800">
                  <p className="text-sm text-zinc-400">{eval_.comments}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                <span>💡 {eval_.scores?.innovation}/10</span>
                <span>⚙️ {eval_.scores?.technical}/10</span>
                <span>🎨 {eval_.scores?.uiux}/10</span>
                <span>🎤 {eval_.scores?.presentation}/10</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}