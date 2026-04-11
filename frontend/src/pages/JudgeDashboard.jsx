import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiAward, FiClock, FiCamera, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { adminAPI } from '../utils/api';

export default function JudgeDashboard() {
  const [stats, setStats] = useState(null);
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hackathonsRes, evaluationsRes] = await Promise.all([
        adminAPI.getHackathons({ isActive: true, limit: 1 }),
        adminAPI.getRounds({}).catch(() => ({ data: { data: [] } }))
      ]);
      
      const hackathon = hackathonsRes.data.data[0];
      
      if (hackathon) {
        const [analyticsRes, myEvalsRes] = await Promise.all([
          adminAPI.getAnalytics({ hackathonId: hackathon._id }),
          adminAPI.getJudge({}).catch(() => ({ data: { data: [] } }))
        ]);
        
        setStats({
          totalTeams: analyticsRes.data.data.totalTeams,
          totalEvaluations: analyticsRes.data.data.totalEvaluations,
          activeJudges: analyticsRes.data.data.activeJudges,
          averageScore: analyticsRes.data.data.averageScore
        });
        setRecentEvaluations(myEvalsRes.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Teams', value: stats?.totalTeams || 0, icon: FiUsers, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Evaluations', value: stats?.totalEvaluations || 0, icon: FiAward, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Active Judges', value: stats?.activeJudges || 0, icon: FiTrendingUp, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { label: 'Avg Score', value: stats?.averageScore || '0', icon: FiClock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Judge Dashboard</h1>
        <p className="text-zinc-500 mt-1">Evaluate and score participating teams</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/scanner" className="card-hover card flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <FiCamera className="text-white text-2xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Scan QR Code</h3>
            <p className="text-sm text-zinc-500">Scan a team's QR to evaluate</p>
          </div>
          <FiArrowRight className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition" />
        </Link>

        <Link to="/leaderboard" className="card-hover card flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <FiTrendingUp className="text-white text-2xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">View Leaderboard</h3>
            <p className="text-sm text-zinc-500">See live rankings</p>
          </div>
          <FiArrowRight className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="stat-card"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-zinc-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Evaluations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Evaluations</h2>
          <Link to="/my-evaluations" className="text-sm text-primary-400 hover:text-primary-300">
            View All
          </Link>
        </div>
        
        {recentEvaluations.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No evaluations yet</p>
        ) : (
          <div className="space-y-3">
            {recentEvaluations.map(eval_ => (
              <div key={eval_._id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div>
                  <p className="font-medium">{eval_?.team?.teamName || 'Team'}</p>
                  <p className="text-sm text-zinc-500">{eval_?.round?.name || 'Round'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-400">{eval_.totalScore}/40</p>
                  <p className="text-xs text-zinc-500">{new Date(eval_.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}