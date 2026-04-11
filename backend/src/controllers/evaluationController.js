import Evaluation from '../models/Evaluation.js';
import Team from '../models/Team.js';
import ActivityLog from '../models/ActivityLog.js';
import memoryStore from '../config/memoryStore.js';

export const submitEvaluation = async (req, res, next) => {
  try {
    const { teamId, roundId, scores, comments, strengths, improvements, recommendation, media } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const existingEvaluation = await Evaluation.findOne({
      team: teamId,
      judge: req.user._id,
      round: roundId
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: 'You have already evaluated this team in this round'
      });
    }

    const totalScore = scores.innovation + scores.technical + scores.uiux + scores.presentation;

    const evaluation = await Evaluation.create({
      team: teamId,
      judge: req.user._id,
      round: roundId,
      hackathon: team.hackathon,
      scores,
      totalScore,
      comments,
      strengths,
      improvements,
      recommendation: recommendation || 'waitlist',
      media: media || []
    });

    const teamEvaluations = await Evaluation.find({ team: teamId, round: roundId });
    const totalTeamScore = teamEvaluations.reduce((sum, e) => sum + e.totalScore, 0);
    const avgScore = totalTeamScore / teamEvaluations.length;

    team.totalScore = totalTeamScore;
    team.averageScore = avgScore;
    team.judgeCount = teamEvaluations.length;
    await team.save();

    await ActivityLog.create({
      user: req.user._id,
      hackathon: team.hackathon,
      action: 'evaluation_submitted',
      entityType: 'evaluation',
      entityId: evaluation._id,
      details: { teamId, roundId, totalScore }
    });

    res.status(201).json({
      success: true,
      message: 'Evaluation submitted successfully',
      data: evaluation
    });
  } catch (error) {
    next(error);
  }
};

export const getEvaluations = async (req, res, next) => {
  try {
    const { teamId, roundId, judgeId, hackathonId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (teamId) query.team = teamId;
    if (roundId) query.round = roundId;
    if (judgeId) query.judge = judgeId;
    if (hackathonId) query.hackathon = hackathonId;

    const skip = (page - 1) * limit;

    const [evaluations, total] = await Promise.all([
      Evaluation.find(query)
        .populate('team', 'teamName projectTitle track')
        .populate('judge', 'name email')
        .populate('round', 'name')
        .populate('hackathon', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Evaluation.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: evaluations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('team')
      .populate('judge', 'name email')
      .populate('round')
      .populate('hackathon');

    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    res.json({ success: true, data: evaluation });
  } catch (error) {
    next(error);
  }
};

export const getJudgeEvaluations = async (req, res, next) => {
  try {
    const { roundId } = req.query;

    const query = { judge: req.user._id };
    if (roundId) query.round = roundId;

    const evaluations = await Evaluation.find(query)
      .populate({
        path: 'team',
        select: 'teamName projectTitle track totalScore'
      })
      .populate('round', 'name order')
      .sort('-createdAt');

    let allEvaluations = evaluations;
    const memEvals = [...memoryStore.evaluations.values()].filter(e => e.judge === req.user._id);
    
    if (memEvals.length > 0) {
      if (roundId) {
        const filteredMemEvals = memEvals.filter(e => e.round === roundId);
        allEvaluations = [...evaluations, ...filteredMemEvals];
      } else {
        allEvaluations = [...evaluations, ...memEvals];
      }
    }

    const enrichedEvals = allEvaluations.map(e => {
      const team = [...memoryStore.teams.values()].find(t => t._id === e.team?._id || t._id === e.team);
      const round = [...memoryStore.rounds.values()].find(r => r._id === e.round?._id || r._id === e.round);
      
      if (team && e.team && typeof e.team === 'object' && !e.team.teamName) {
        return {
          ...e.toObject ? e.toObject() : e,
          team: { ...e.team, ...team }
        };
      }
      if (round && e.round && typeof e.round === 'object' && !e.round.name) {
        return {
          ...e.toObject ? e.toObject() : e,
          round: { ...e.round, ...round }
        };
      }
      return e;
    });

    res.json({ success: true, data: enrichedEvals });
  } catch (error) {
    next(error);
  }
};

export const updateEvaluation = async (req, res, next) => {
  try {
    const { scores, comments, recommendation, isFinalized } = req.body;

    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    if (evaluation.judge.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (evaluation.isFinalized) {
      return res.status(400).json({ success: false, message: 'Cannot update finalized evaluation' });
    }

    const updates = {};
    if (scores) {
      updates.scores = scores;
      updates.totalScore = scores.innovation + scores.technical + scores.uiux + scores.presentation;
    }
    if (comments !== undefined) updates.comments = comments;
    if (recommendation) updates.recommendation = recommendation;
    if (isFinalized !== undefined) updates.isFinalized = isFinalized;

    const updatedEvaluation = await Evaluation.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('team', 'teamName projectTitle')
      .populate('judge', 'name');

    res.json({ success: true, message: 'Evaluation updated', data: updatedEvaluation });
  } catch (error) {
    next(error);
  }
};

export const deleteEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    if (evaluation.judge.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await evaluation.deleteOne();

    const team = await Team.findById(evaluation.team);
    if (team) {
      const teamEvaluations = await Evaluation.find({ team: evaluation.team, round: evaluation.round });
      const totalScore = teamEvaluations.reduce((sum, e) => sum + e.totalScore, 0);
      team.totalScore = totalScore;
      team.averageScore = teamEvaluations.length ? totalScore / teamEvaluations.length : 0;
      team.judgeCount = teamEvaluations.length;
      await team.save();
    }

    res.json({ success: true, message: 'Evaluation deleted' });
  } catch (error) {
    next(error);
  }
};