import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiFilter, FiAward, FiUsers, FiExternalLink } from 'react-icons/fi';
import { useTeamStore } from '../store/useAuthStore';

const DEMO_TEAMS = [
  { _id: 't3', teamName: 'Gamma Coders', projectTitle: 'AR Navigation System', track: 'AI/ML', totalScore: 142, averageScore: 9.2, judgeCount: 12, status: 'qualified' },
  { _id: 't1', teamName: 'Alpha Innovators', projectTitle: 'AI Health Assistant', track: 'AI/ML', totalScore: 135, averageScore: 8.75, judgeCount: 12, status: 'qualified' },
  { _id: 't5', teamName: 'Omega Developers', projectTitle: 'DeFi Platform', track: 'FinTech', totalScore: 125, averageScore: 8.0, judgeCount: 11, status: 'qualified' },
  { _id: 't2', teamName: 'Beta Wizards', projectTitle: 'Blockchain Supply Chain', track: 'Blockchain', totalScore: 118, averageScore: 7.15, judgeCount: 12, status: 'registered' },
  { _id: 't4', teamName: 'Delta Vision', projectTitle: 'Sustainable Energy IoT', track: 'IoT', totalScore: 98, averageScore: 6.5, judgeCount: 10, status: 'registered' }
];

export default function Leaderboard() {
  const [teams, setTeams] = useState(DEMO_TEAMS);
  const [filter, setFilter] = useState('all');

  const filteredTeams = filter === 'all' ? teams : teams.filter(t => t.track === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiTrendingUp className="text-primary-400" />
            Live Leaderboard
          </h1>
          <p className="text-zinc-500 mt-1">Real-time rankings • {teams.length} teams</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2"
          >
            <option value="all">All Tracks</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Blockchain">Blockchain</option>
            <option value="FinTech">FinTech</option>
            <option value="IoT">IoT</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      {filter === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[filteredTeams[1], filteredTeams[0], filteredTeams[2]].map((team, idx) => (
            team && (
              <div 
                key={team._id}
                className={`card text-center card-hover ${idx === 1 ? 'md:-mt-4 order-2' : ''}`}
              >
                <div className="text-5xl mb-3">
                  {idx === 1 ? '🥇' : idx === 0 ? '🥈' : '🥉'}
                </div>
                <h3 className="font-bold text-lg">{team.teamName}</h3>
                <p className="text-sm text-zinc-500">{team.projectTitle}</p>
                <p className="text-xs text-zinc-600 mb-3">{team.track}</p>
                <div className="text-3xl font-bold gradient-text">{team.averageScore}</div>
                <p className="text-xs text-zinc-500 mt-1">{team.judgeCount} judges</p>
              </div>
            )
          ))}
        </motion.div>
      )}

      {/* Full Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Team</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Project</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Track</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Score</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Judges</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team, idx) => (
              <tr key={team._id} className="table-row">
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                    idx < 3 ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-zinc-400'
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium">{team.teamName}</div>
                </td>
                <td className="px-4 py-4 text-zinc-400">{team.projectTitle}</td>
                <td className="px-4 py-4 text-center">
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">{team.track}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-2xl font-bold gradient-text">{team.averageScore}</span>
                </td>
                <td className="px-4 py-4 text-center text-zinc-400">{team.judgeCount}</td>
                <td className="px-4 py-4 text-center">
                  <Link 
                    to={`/judge?team=${team._id}`}
                    className="btn-secondary text-sm py-2 px-3"
                  >
                    Evaluate
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}