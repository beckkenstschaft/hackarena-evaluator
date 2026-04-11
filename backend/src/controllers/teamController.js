import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';
import memoryStore from '../config/memoryStore.js';

export const registerTeam = async (req, res, next) => {
  try {
    const { hackathonId, teamName, projectTitle, description, track, members, contactEmail, prototypeLink, repositoryLink } = req.body;

    // Check hackathon exists in memory
    let hackathon = hackathonId ? memoryStore.hackathons.get(hackathonId) : [...memoryStore.hackathons.values()][0];
    if (!hackathon && Hackathon.db) {
      hackathon = await Hackathon.findById(hackathonId);
    }

    // Check team name unique in memory
    const existingTeam = [...memoryStore.teams.values()].find(t => t.teamName === teamName);
    if (existingTeam) {
      return res.status(400).json({ success: false, message: 'Team name already taken' });
    }

    const uniqueId = `${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrData = `${baseUrl}/judge?team=${uniqueId}`;

    let qrCode = '';
    try {
      qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
    } catch (e) {
      qrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    const team = {
      _id: `t${Date.now()}`,
      hackathon: hackathon?._id || 'h1',
      user: req.headers['x-user-id'] || '3',
      teamName,
      projectTitle,
      description,
      track,
      members: members || [],
      contactEmail,
      prototypeLink,
      repositoryLink,
      qrCode,
      status: 'registered',
      totalScore: 0,
      averageScore: 0,
      judgeCount: 0
    };

    memoryStore.teams.set(team._id, team);

    res.status(201).json({
      success: true,
      message: 'Team registered successfully',
      data: team
    });
  } catch (error) {
    next(error);
  }
};

export const getTeams = async (req, res, next) => {
  try {
    const { hackathonId, track, status, page = 1, limit = 20 } = req.query;
    
    let allTeams = [...memoryStore.teams.values()];
    
    if (hackathonId) allTeams = allTeams.filter(t => t.hackathon === hackathonId);
    if (track) allTeams = allTeams.filter(t => t.track === track);
    if (status) allTeams = allTeams.filter(t => t.status === status);

    // Sort by score
    allTeams.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    const start = (page - 1) * limit;
    const teams = allTeams.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      data: teams,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: allTeams.length, pages: Math.ceil(allTeams.length / limit) }
    });
  } catch (error) {
    next(error);
  }
};

export const getTeam = async (req, res, next) => {
  try {
    const team = memoryStore.teams.get(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

export const getTeamByQRId = async (req, res, next) => {
  try {
    const team = memoryStore.teams.get(req.params.qrId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const team = memoryStore.teams.get(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const updates = { ...req.body };
    delete updates._id;
    const updated = { ...team, ...updates };
    memoryStore.teams.set(team._id, updated);

    res.json({ success: true, message: 'Team updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const team = memoryStore.teams.get(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    memoryStore.teams.delete(req.params.id);
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMyTeams = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || '3';
    const teams = [...memoryStore.teams.values()].filter(t => t.user === userId);
    res.json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

export const getTeamQRCode = async (req, res, next) => {
  try {
    const team = memoryStore.teams.get(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: { qrCode: team.qrCode } });
  } catch (error) {
    next(error);
  }
};