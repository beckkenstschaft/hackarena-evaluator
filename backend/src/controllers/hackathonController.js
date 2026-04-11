import mongoose from 'mongoose';
import Hackathon from '../models/Hackathon.js';
import Round from '../models/Round.js';
import Team from '../models/Team.js';
import Evaluation from '../models/Evaluation.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import memoryStore from '../config/memoryStore.js';

export const createHackathon = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, tracks, rules, prizes, coverImage } = req.body;

    const hackathon = await Hackathon.create({
      name,
      description,
      startDate,
      endDate,
      tracks: tracks || [],
      rules,
      prizes: prizes || [],
      coverImage,
      createdBy: req.user._id
    });

    await Round.create({
      hackathon: hackathon._id,
      name: 'Idea Round',
      description: 'Initial idea submission round',
      order: 1,
      isActive: true,
      isPublished: true,
      startDate,
      endDate
    });

    await ActivityLog.create({
      user: req.user._id,
      hackathon: hackathon._id,
      action: 'hackathon_created',
      entityType: 'hackathon',
      entityId: hackathon._id,
      details: { name }
    });

    res.status(201).json({
      success: true,
      message: 'Hackathon created successfully',
      data: hackathon
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathons = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const [hackathons, total] = await Promise.all([
      Hackathon.find(query)
        .populate('createdBy', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Hackathon.countDocuments(query)
    ]);

    let allHackathons = hackathons;
    
    const memHackathons = [...memoryStore.hackathons.values()];
    if (memHackathons.length > 0) {
      if (isActive === 'true') {
        const activeMemHackathons = memHackathons.filter(h => h.isActive);
        allHackathons = [...hackathons, ...activeMemHackathons];
      } else {
        allHackathons = [...hackathons, ...memHackathons];
      }
    }

    res.json({
      success: true,
      data: allHackathons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total + memHackathons.length,
        pages: Math.ceil((total + memHackathons.length) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    res.json({ success: true, data: hackathon });
  } catch (error) {
    next(error);
  }
};

export const updateHackathon = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, isActive, tracks, rules, prizes } = req.body;

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (startDate) updates.startDate = startDate;
    if (endDate) updates.endDate = endDate;
    if (isActive !== undefined) updates.isActive = isActive;
    if (tracks) updates.tracks = tracks;
    if (rules !== undefined) updates.rules = rules;
    if (prizes) updates.prizes = prizes;

    const updated = await Hackathon.findByIdAndUpdate(req.params.id, updates, { new: true });

    await ActivityLog.create({
      user: req.user._id,
      hackathon: updated._id,
      action: 'hackathon_updated',
      entityType: 'hackathon',
      entityId: updated._id,
      details: updates
    });

    res.json({ success: true, message: 'Hackathon updated', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    await Promise.all([
      Round.deleteMany({ hackathon: hackathon._id }),
      Team.deleteMany({ hackathon: hackathon._id }),
      Evaluation.deleteMany({ hackathon: hackathon._id })
    ]);

    await hackathon.deleteOne();

    res.json({ success: true, message: 'Hackathon deleted' });
  } catch (error) {
    next(error);
  }
};

export const createRound = async (req, res, next) => {
  try {
    const { hackathonId, name, description, order, qualificationThreshold, startDate, endDate, judgingCriteria } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const round = await Round.create({
      hackathon: hackathonId,
      name,
      description,
      order: order || 1,
      qualificationThreshold: qualificationThreshold || 0,
      startDate,
      endDate,
      judgingCriteria: judgingCriteria || {}
    });

    res.status(201).json({
      success: true,
      message: 'Round created',
      data: round
    });
  } catch (error) {
    next(error);
  }
};

export const getRounds = async (req, res, next) => {
  try {
    const { hackathonId } = req.query;

    const query = {};
    if (hackathonId) query.hackathon = hackathonId;

    const rounds = await Round.find(query)
      .populate('hackathon', 'name')
      .sort('order');

    let allRounds = rounds;
    const memRounds = [...memoryStore.rounds.values()];
    
    if (memRounds.length > 0) {
      if (hackathonId) {
        const filteredMemRounds = memRounds.filter(r => r.hackathon === hackathonId);
        allRounds = [...rounds, ...filteredMemRounds];
      } else {
        allRounds = [...rounds, ...memRounds];
      }
    }

    allRounds.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ success: true, data: allRounds });
  } catch (error) {
    next(error);
  }
};

export const getRound = async (req, res, next) => {
  try {
    const round = await Round.findById(req.params.id)
      .populate('hackathon');

    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }

    res.json({ success: true, data: round });
  } catch (error) {
    next(error);
  }
};

export const updateRound = async (req, res, next) => {
  try {
    const { name, description, order, qualificationThreshold, isActive, isPublished, startDate, endDate } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (order) updates.order = order;
    if (qualificationThreshold !== undefined) updates.qualificationThreshold = qualificationThreshold;
    if (isActive !== undefined) updates.isActive = isActive;
    if (isPublished !== undefined) updates.isPublished = isPublished;
    if (startDate) updates.startDate = startDate;
    if (endDate) updates.endDate = endDate;

    const round = await Round.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.json({ success: true, message: 'Round updated', data: round });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { hackathonId, roundId } = req.query;

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: 'Hackathon ID required' });
    }

    const query = { hackathon: hackathonId };
    if (roundId) query.round = roundId;

    const [teams, evaluations, activeJudges, tracks] = await Promise.all([
      Team.find({ hackathon: hackathonId }),
      Evaluation.find(query),
      Evaluation.distinct('judge', { hackathon: hackathonId }),
      Team.aggregate([
        { $match: { hackathon: new mongoose.Types.ObjectId(hackathonId) } },
        { $group: { _id: '$track', count: { $sum: 1 } } }
      ])
    ]);

    const avgScoresByTrack = {};
    const trackCounts = {};
    teams.forEach(team => {
      if (!trackCounts[team.track]) {
        trackCounts[team.track] = { total: 0, count: 0 };
      }
      trackCounts[team.track].total += team.averageScore;
      trackCounts[team.track].count++;
    });
    Object.keys(trackCounts).forEach(track => {
      avgScoresByTrack[track] = trackCounts[track].count
        ? (trackCounts[track].total / trackCounts[track].count).toFixed(1)
        : 0;
    });

    const topTeams = await Team.find({ hackathon: hackathonId })
      .sort('-averageScore')
      .limit(10)
      .select('teamName projectTitle track averageScore judgeCount');

    const scoreDistribution = {
      '30-40': 0,
      '20-30': 0,
      '10-20': 0,
      '0-10': 0
    };
    teams.forEach(team => {
      if (team.averageScore >= 30) scoreDistribution['30-40']++;
      else if (team.averageScore >= 20) scoreDistribution['20-30']++;
      else if (team.averageScore >= 10) scoreDistribution['10-20']++;
      else scoreDistribution['0-10']++;
    });

    res.json({
      success: true,
      data: {
        totalTeams: teams.length,
        totalEvaluations: evaluations.length,
        activeJudges: activeJudges.length,
        tracks: tracks.map(t => ({ track: t._id, count: t.count })),
        avgScoresByTrack,
        topTeams,
        scoreDistribution,
        averageScore: evaluations.length
          ? (evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length).toFixed(1)
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getJudgePerformance = async (req, res, next) => {
  try {
    const { hackathonId } = req.query;

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: 'Hackathon ID required' });
    }

    const judgeStats = await Evaluation.aggregate([
      { $match: { hackathon: new mongoose.Types.ObjectId(hackathonId) } },
      {
        $group: {
          _id: '$judge',
          evaluations: { $sum: 1 },
          avgScore: { $avg: '$totalScore' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'judge'
        }
      },
      { $unwind: '$judge' },
      {
        $project: {
          name: '$judge.name',
          email: '$judge.email',
          evaluations: 1,
          avgScore: { $round: ['$avgScore', 1] }
        }
      },
      { $sort: { evaluations: -1 } }
    ]);

    res.json({ success: true, data: judgeStats });
  } catch (error) {
    next(error);
  }
};

export const exportData = async (req, res, next) => {
  try {
    const { hackathonId, type } = req.query;

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: 'Hackathon ID required' });
    }

    let data;
    if (type === 'teams') {
      data = await Team.find({ hackathon: hackathonId })
        .populate('user', 'name email')
        .select('teamName projectTitle track members contactEmail totalScore averageScore status');
    } else if (type === 'evaluations') {
      data = await Evaluation.find({ hackathon: hackathonId })
        .populate('team', 'teamName')
        .populate('judge', 'name')
        .select('team judge scores totalScore recommendation createdAt');
    } else {
      data = await Team.find({ hackathon: hackathonId })
        .populate('user', 'name email')
        .select('teamName projectTitle track totalScore averageScore');
    }

    await ActivityLog.create({
      user: req.user._id,
      hackathon: hackathonId,
      action: 'export_data',
      details: { type, count: data.length }
    });

    res.json({
      success: true,
      data: data.map(item => item.toObject())
    });
  } catch (error) {
    next(error);
  }
};