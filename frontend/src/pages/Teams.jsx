import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiAward, FiExternalLink } from 'react-icons/fi';

const DEMO_TEAMS = [
  { _id: 't1', teamName: 'Alpha Innovators', projectTitle: 'AI Health Assistant', track: 'AI/ML', members: [{name: 'John Doe', role: 'Leader'}, {name: 'Jane Smith', role: 'Developer'}], totalScore: 135, averageScore: 8.75, judgeCount: 12 },
  { _id: 't2', teamName: 'Beta Wizards', projectTitle: 'Blockchain Supply Chain', track: 'Blockchain', members: [{name: 'Mike Ross', role: 'CEO'}], totalScore: 118, averageScore: 7.15, judgeCount: 12 },
  { _id: 't3', teamName: 'Gamma Coders', projectTitle: 'AR Navigation System', track: 'AI/ML', members: [{name: 'Sarah Connor', role: 'Team Lead'}, {name: 'Tom Hardy', role: 'Backend'}], totalScore: 142, averageScore: 9.2, judgeCount: 12 },
  { _id: 't4', teamName: 'Delta Vision', projectTitle: 'Sustainable Energy IoT', track: 'IoT', members: [{name: 'Emma Watson', role: 'Lead'}], totalScore: 98, averageScore: 6.5, judgeCount: 10 },
  { _id: 't5', teamName: 'Omega Developers', projectTitle: 'DeFi Platform', track: 'FinTech', members: [{name: 'Chris Evans', role: 'Founder'}], totalScore: 125, averageScore: 8.0, judgeCount: 11 }
];

export default function Teams() {
  const [teams] = useState(DEMO_TEAMS);
  const [search, setSearch] = useState('');

  const filteredTeams = teams.filter(t => 
    t.teamName.toLowerCase().includes(search.toLowerCase()) ||
    t.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    t.track?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiUsers className="text-primary-400" />
            Teams
          </h1>
          <p className="text-zinc-500 mt-1">{teams.length} registered teams</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-64"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team, idx) => (
          <motion.div
            key={team._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{team.teamName}</h3>
                <p className="text-sm text-zinc-500">{team.projectTitle}</p>
              </div>
              <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-xs">
                {team.track}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
              <span className="flex items-center gap-1">
                <FiUsers size={14} />
                {team.members?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <FiAward size={14} />
                {team.averageScore}
              </span>
            </div>
            
            <Link 
              to={`/judge?team=${team._id}`}
              className="btn-primary flex-1 text-center py-2 block"
            >
              Evaluate
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}