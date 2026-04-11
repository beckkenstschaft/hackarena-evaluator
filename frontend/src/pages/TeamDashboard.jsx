import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiAward, FiTrendingUp, FiExternalLink, FiDownload, FiPlus } from 'react-icons/fi';
import { teamAPI, leaderboardAPI, adminAPI } from '../utils/api';

export default function TeamDashboard() {
  const [team, setTeam] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const [teamsRes, hackathonsRes] = await Promise.all([
        teamAPI.getMy(),
        adminAPI.getHackathons({ isActive: true, limit: 1 })
      ]);
      
      if (teamsRes.data.data.length > 0) {
        const myTeam = teamsRes.data.data[0];
        setTeam(myTeam);
        
        const hackathon = hackathonsRes.data.data[0];
        if (hackathon) {
          try {
            const positionRes = await leaderboardAPI.getPosition({ 
              hackathonId: hackathon._id, 
              teamId: myTeam._id 
            });
            setPosition(positionRes.data.data);
          } catch (e) {
            console.log('Position not available');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-8">
        {/* Empty State */}
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6">
            <FiUsers className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Register Your Team</h2>
          <p className="text-zinc-500 mb-6">Join a hackathon and start your journey!</p>
          <Link to="/teams" className="btn-primary inline-flex items-center gap-2">
            <FiPlus />
            Register Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{team.teamName}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                team.status === 'qualified' ? 'bg-green-500/20 text-green-400' :
                team.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                'bg-primary-500/20 text-primary-400'
              }`}>
                {team.status}
              </span>
            </div>
            <p className="text-zinc-400">{team.projectTitle}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <FiAward size={14} />
                {team.track}
              </span>
              <span className="flex items-center gap-1">
                <FiUsers size={14} />
                {team.members?.length || 0} members
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {team.prototypeLink && (
              <a href={team.prototypeLink} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
                <FiExternalLink size={16} />
                Demo
              </a>
            )}
            {team.qrCode && (
              <button className="btn-secondary flex items-center gap-2">
                <FiDownload size={16} />
                QR Code
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <FiTrendingUp className="text-primary-400 mb-2" size={24} />
          <p className="text-2xl font-bold">{position?.rank || '#--'}</p>
          <p className="text-sm text-zinc-500">Rank</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <FiAward className="text-yellow-400 mb-2" size={24} />
          <p className="text-2xl font-bold">{team.totalScore || 0}</p>
          <p className="text-sm text-zinc-500">Total Score</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <FiUsers className="text-green-400 mb-2" size={24} />
          <p className="text-2xl font-bold">{team.judgeCount || 0}</p>
          <p className="text-sm text-zinc-500">Judges</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <FiTrendingUp className="text-accent-400 mb-2" size={24} />
          <p className="text-2xl font-bold">{team.averageScore || 0}</p>
          <p className="text-sm text-zinc-500">Average</p>
        </motion.div>
      </div>

      {/* Team Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="font-semibold mb-4">Project Description</h3>
          <p className="text-zinc-400">{team.description || 'No description provided'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="font-semibold mb-4">Team Members</h3>
          <div className="space-y-3">
            {team.members?.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold">
                  {member.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-zinc-500">{member.role}</p>
                </div>
              </div>
            ))}
            {(!team.members || team.members.length === 0) && (
              <p className="text-zinc-500">No members added</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}