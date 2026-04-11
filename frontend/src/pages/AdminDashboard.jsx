import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiAward, FiGrid, FiDownload, FiPlus, FiTrendingUp } from 'react-icons/fi';

const DEMO_STATS = {
  totalTeams: 5,
  totalEvaluations: 38,
  activeJudges: 3,
  averageScore: 7.9
};

const DEMO_TEAMS = [
  { _id: 't3', teamName: 'Gamma Coders', projectTitle: 'AR Navigation System', track: 'AI/ML', totalScore: 142, averageScore: 9.2, judgeCount: 12 },
  { _id: 't1', teamName: 'Alpha Innovators', projectTitle: 'AI Health Assistant', track: 'AI/ML', totalScore: 135, averageScore: 8.75, judgeCount: 12 },
  { _id: 't5', teamName: 'Omega Developers', projectTitle: 'DeFi Platform', track: 'FinTech', totalScore: 125, averageScore: 8.0, judgeCount: 11 },
  { _id: 't2', teamName: 'Beta Wizards', projectTitle: 'Blockchain Supply Chain', track: 'Blockchain', totalScore: 118, averageScore: 7.15, judgeCount: 12 },
  { _id: 't4', teamName: 'Delta Vision', projectTitle: 'Sustainable Energy IoT', track: 'IoT', totalScore: 98, averageScore: 6.5, judgeCount: 10 }
];

const TRACK_DATA = [
  { track: 'AI/ML', score: 8.9, teams: 2 },
  { track: 'FinTech', score: 8.0, teams: 1 },
  { track: 'Blockchain', score: 7.2, teams: 1 },
  { track: 'IoT', score: 6.5, teams: 1 }
];

export default function AdminDashboard() {
  const [stats] = useState(DEMO_STATS);
  const [topTeams] = useState(DEMO_TEAMS.slice(0, 5));

  const statCards = [
    { label: 'Total Teams', value: stats.totalTeams, icon: FiUsers, color: 'from-primary-500 to-primary-600' },
    { label: 'Evaluations', value: stats.totalEvaluations, icon: FiAward, color: 'from-green-500 to-green-600' },
    { label: 'Active Judges', value: stats.activeJudges, icon: FiGrid, color: 'from-accent-500 to-accent-600' },
    { label: 'Avg Score', value: stats.averageScore, icon: FiTrendingUp, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-zinc-500 mt-1">HackArena Demo 2026</p>
        </div>
        <div className="flex gap-3">
          <Link to="/teams" className="btn-secondary flex items-center gap-2">
            <FiPlus size={18} />
            New Hackathon
          </Link>
        </div>
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
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="text-white" size={24} />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-zinc-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Bar Chart Visual */}
      <div className="card">
        <h3 className="font-semibold mb-4">Score by Track</h3>
        <div className="space-y-4">
          {TRACK_DATA.map((item, idx) => (
            <div key={item.track}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.track}</span>
                <span className="text-primary-400">{item.score}</span>
              </div>
              <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score * 10}%` }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">{item.teams} teams</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Teams */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="font-semibold mb-4">Top Teams</h3>
        <div className="space-y-3">
          {topTeams.map((team, idx) => (
            <div key={team._id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  idx === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                  idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                  'bg-dark-700 text-zinc-500'
                }`}>
                  {idx + 1}
                </span>
                <div>
                  <p className="font-medium">{team.teamName}</p>
                  <p className="text-xs text-zinc-500">{team.track}</p>
                </div>
              </div>
              <p className="font-bold text-primary-400">{team.averageScore}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}