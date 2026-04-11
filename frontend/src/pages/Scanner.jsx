import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCamera, FiStopCircle, FiEdit, FiCheck } from 'react-icons/fi';
import { useTeamStore } from '../store/useAuthStore';

const DEMO_TEAMS = [
  { _id: 't1', teamName: 'Alpha Innovators', projectTitle: 'AI Health Assistant', track: 'AI/ML' },
  { _id: 't2', teamName: 'Beta Wizards', projectTitle: 'Blockchain Supply Chain', track: 'Blockchain' },
  { _id: 't3', teamName: 'Gamma Coders', projectTitle: 'AR Navigation System', track: 'AI/ML' },
  { _id: 't4', teamName: 'Delta Vision', projectTitle: 'Sustainable Energy IoT', track: 'IoT' },
  { _id: 't5', teamName: 'Omega Developers', projectTitle: 'DeFi Platform', track: 'FinTech' }
];

export default function Scanner() {
  const [searchParams] = useSearchParams();
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [teams, setTeams] = useState(DEMO_TEAMS);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const html5QrCode = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const teamId = searchParams.get('team');
    if (teamId) {
      navigate(`/judge?team=${teamId}`);
    }
  }, [searchParams, navigate]);

  const startScanner = async () => {
    try {
      setError('');
      if (!html5QrCode.current) {
        html5QrCode.current = new window.Html5Qrcode('qr-reader');
      }
      await html5QrCode.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => { }
      );
      setScanning(true);
    } catch (err) {
      console.log('Camera error:', err);
      setError('Camera not available. Use manual selection below.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCode.current && scanning) {
      try {
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
      } catch (e) {}
    }
    setScanning(false);
  };

  const handleScan = (decodedText) => {
    setLastScan(decodedText);
    const match = decodedText.match(/team=([a-zA-Z0-9-]+)/);
    if (match) {
      stopScanner();
      navigate(`/judge?team=${match[1]}`);
    } else {
      const team = teams.find(t => t.teamName.toLowerCase().includes(decodedText.toLowerCase()));
      if (team) {
        stopScanner();
        navigate(`/judge?team=${team._id}`);
      }
    }
  };

  const handleManualSelect = (team) => {
    setSelectedTeam(team);
    navigate(`/judge?team=${team._id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FiCamera className="text-primary-400" />
          QR Scanner
        </h1>
        <p className="text-zinc-500 mt-1">Scan team QR code or select manually</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden bg-dark-950 min-h-[300px] flex items-center justify-center">
            {!scanning && (
              <div className="text-zinc-500 p-8 text-center">
                <FiCamera size={48} className="mx-auto mb-4 opacity-50" />
                <p>Click "Start Camera" to scan QR</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            {!scanning ? (
              <button onClick={startScanner} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <FiCamera />
                Start Camera
              </button>
            ) : (
              <button onClick={stopScanner} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <FiStopCircle />
                Stop Camera
              </button>
            )}
          </div>

          {lastScan && (
            <div className="mt-4 p-3 bg-dark-800/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">Last scan:</p>
              <p className="text-sm truncate">{lastScan}</p>
            </div>
          )}
        </motion.div>

        {/* Manual Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FiEdit />
            Select Team
          </h3>
          
          <div className="space-y-2">
            {teams.map(team => (
              <button
                key={team._id}
                onClick={() => handleManualSelect(team)}
                className="w-full p-4 bg-dark-800/50 hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent rounded-xl text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{team.teamName}</p>
                  <p className="text-xs text-zinc-500">{team.projectTitle} • {team.track}</p>
                </div>
                <FiCheck className="text-green-400 opacity-0" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}