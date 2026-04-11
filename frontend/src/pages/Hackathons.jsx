import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiPlus, FiCalendar, FiEdit, FiTrash2 } from 'react-icons/fi';
import { adminAPI } from '../utils/api';

const defaultTracks = ['AI/ML', 'Blockchain', 'Web3', 'IoT', 'FinTech', 'HealthTech', 'EdTech', 'Sustainability'];

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    tracks: defaultTracks,
    rules: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const res = await adminAPI.getHackathons({});
      setHackathons(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateHackathon(editingId, formData);
      } else {
        await adminAPI.createHackathon(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', startDate: '', endDate: '', tracks: defaultTracks, rules: '' });
      fetchHackathons();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hackathon) => {
    setEditingId(hackathon._id);
    setFormData({
      name: hackathon.name,
      description: hackathon.description || '',
      startDate: hackathon.startDate?.slice(0, 10) || '',
      endDate: hackathon.endDate?.slice(0, 10) || '',
      tracks: hackathon.tracks || defaultTracks,
      rules: hackathon.rules || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this hackathon?')) return;
    try {
      await adminAPI.deleteHackathon(id);
      fetchHackathons();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiGrid className="text-primary-400" />
            Hackathons
          </h1>
          <p className="text-zinc-500 mt-1">Manage hackathon events</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', description: '', startDate: '', endDate: '', tracks: defaultTracks, rules: '' }); }} className="btn-primary flex items-center gap-2">
          <FiPlus />
          Create Hackathon
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Hackathon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-400">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-400">Tracks (comma separated)</label>
                <input type="text" value={formData.tracks.join(', ')} onChange={e => setFormData({...formData, tracks: e.target.value.split(', ')})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-400">Start Date</label>
                <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-400">End Date</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-400">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field min-h-[100px]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-400">Rules</label>
              <textarea value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})} className="input-field min-h-[100px]" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : hackathons.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">No hackathons yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hackathons.map((hackathon, idx) => (
            <motion.div key={hackathon._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{hackathon.name}</h3>
                  <p className="text-sm text-zinc-500">{hackathon.tracks?.length || 0} tracks</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${hackathon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-zinc-400'}`}>
                  {hackathon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{hackathon.description}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                <FiCalendar />
                {hackathon.startDate?.slice(0, 10)} - {hackathon.endDate?.slice(0, 10)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(hackathon)} className="btn-secondary flex-1 py-2">Edit</button>
                <button onClick={() => handleDelete(hackathon._id)} className="btn-secondary py-2 px-3 text-red-400 hover:bg-red-500/10">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}