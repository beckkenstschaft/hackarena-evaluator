import Team from '../models/Team.js';
import Evaluation from '../models/Evaluation.js';
import Round from '../models/Round.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { hackathonId, roundId, track, page = 1, limit = 50 } = req.query;

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: 'Hackathon ID required' });
    }

    const query = { hackathon: hackathonId };
    if (track) query.track = track;
    if (roundId) query.round = roundId;

    const skip = (page - 1) * limit;

    const teams = await Team.find(query)
      .populate('user', 'name')
      .sort('-averageScore')
      .skip(skip)
      .limit(parseInt(limit));

    const leaderboard = await Promise.all(
      teams.map(async (team, index) => {
        const evaluationCount = roundId
          ? await Evaluation.countDocuments({ team: team._id, round: roundId })
          : await Evaluation.countDocuments({ team: team._id });

        return {
          rank: parseInt(skip) + index + 1,
          _id: team._id,
          teamName: team.teamName,
          projectTitle: team.projectTitle,
          track: team.track,
          totalScore: team.totalScore,
          averageScore: team.averageScore,
          judgeCount: evaluationCount,
          status: team.status,
          isQualified: team.isQualified
        };
      })
    );

    const total = await Team.countDocuments(query);

    res.json({
      success: true,
      data: leaderboard,
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

export const getTeamLeaderboardPosition = async (req, res, next) => {
  try {
    const { hackathonId, teamId } = req.query;

    if (!hackathonId || !teamId) {
      return res.status(400).json({ success: false, message: 'Hackathon ID and Team ID required' });
    }

    const team = await Team.findOne({ _id: teamId, hackathon: hackathonId });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const rank = await Team.countDocuments({
      hackathon: hackathonId,
      averageScore: { $gt: team.averageScore }
    }) + 1;

    res.json({
      success: true,
      data: {
        teamId,
        rank,
        averageScore: team.averageScore,
        totalScore: team.totalScore,
        judgeCount: team.judgeCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLiveScores = async (req, res, next) => {
  try {
    const { hackathonId, roundId } = req.query;

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: 'Hackathon ID required' });
    }

    const query = { hackathon: hackathonId };
    if (roundId) query.round = roundId;

    const teams = await Team.find({ hackathon: hackathonId })
      .sort('-averageScore')
      .limit(100)
      .select('teamName projectTitle track averageScore judgeCount totalScore');

    const updates = await Promise.all(
      teams.map(async (team) => {
        const evaluations = await Evaluation.find({
          team: team._id,
          ...(roundId && { round: roundId })
        });

        const latestScore = evaluations.length > 0
          ? evaluations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].totalScore
          : 0;

        return {
          teamId: team._id,
          teamName: team.teamName,
          projectTitle: team.projectTitle,
          track: team.track,
          averageScore: team.averageScore,
          totalScore: team.totalScore,
          judgeCount: team.judgeCount,
          latestScore
        };
      })
    );

    res.json({ success: true, data: updates });
  } catch (error) {
    next(error);
  }
};