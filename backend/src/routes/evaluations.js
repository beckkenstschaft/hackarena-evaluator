import express from 'express';
import { getDb } from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import { exportEvaluationsToExcel } from '../utils/excelExport.js';

const router = express.Router();

const CRITERIA = ['novelty', 'usage_score', 'methodology', 'presentation', 'uniqueness'];
const MAX_SCORE = 20;
const MAX_TEAMS_PER_JUDGE_PER_ROUND = 20;

router.post('/', (req, res) => {
  const { teamId, judgeId, roundNumber, novelty, usage_score, methodology, presentation, uniqueness, remarks } = req.body;
  
  if (!teamId || !judgeId) {
    return res.status(400).json({ error: 'Team ID and Judge ID are required' });
  }

  for (const criterion of CRITERIA) {
    const value = req.body[criterion];
    if (value === undefined || value === null) {
      return res.status(400).json({ error: `${criterion} score is required` });
    }
    if (value < 0 || value > MAX_SCORE) {
      return res.status(400).json({ error: `${criterion} must be between 0 and ${MAX_SCORE}` });
    }
  }

  const db = getDb();
  const id = uuidv4();
  const round = roundNumber || 1;
  const totalScore = novelty + usage_score + methodology + presentation + uniqueness;
  const remarksValue = remarks && remarks.trim() ? remarks.trim() : 'NA';

  try {
    const existingEval = db.prepare(
      'SELECT * FROM evaluations WHERE team_id = ? AND judge_id = ? AND round_number = ?'
    ).get(teamId, judgeId, round);

    if (existingEval) {
      return res.status(400).json({ error: 'Evaluation already exists for this team, judge, and round' });
    }

    const evalCount = db.prepare(
      'SELECT COUNT(*) as count FROM evaluations WHERE judge_id = ? AND round_number = ?'
    ).get(judgeId, round);

    if (evalCount.count >= MAX_TEAMS_PER_JUDGE_PER_ROUND) {
      return res.status(400).json({ 
        error: `Maximum limit of ${MAX_TEAMS_PER_JUDGE_PER_ROUND} teams reached for round ${round}. Please evaluate in round ${round + 1}.`,
        nextRound: round + 1,
        teamsEvaluated: evalCount.count
      });
    }

    const stmt = db.prepare(`
      INSERT INTO evaluations (id, team_id, judge_id, round_number, novelty, usage_score, methodology, presentation, uniqueness, total_score, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, teamId, judgeId, round, novelty, usage_score, methodology, presentation, uniqueness, totalScore, remarksValue);
    
    exportEvaluationsToExcel(db);
    
    res.status(201).json({
      id,
      teamId,
      judgeId,
      roundNumber: round,
      novelty,
      usage_score,
      methodology,
      presentation,
      uniqueness,
      totalScore,
      remarks: remarksValue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const db = getDb();
  const { round, teamId, judgeId } = req.query;
  
  let query = `
    SELECT e.*, t.team_name, t.team_leader, j.name as judge_name
    FROM evaluations e
    JOIN teams t ON e.team_id = t.id
    JOIN judges j ON e.judge_id = j.id
  `;
  
  const conditions = [];
  const params = [];

  if (round) {
    conditions.push('e.round_number = ?');
    params.push(round);
  }
  if (teamId) {
    conditions.push('e.team_id = ?');
    params.push(teamId);
  }
  if (judgeId) {
    conditions.push('e.judge_id = ?');
    params.push(judgeId);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY e.evaluated_at DESC';

  const evaluations = db.prepare(query).all(...params);
  res.json(evaluations);
});

router.get('/round/:roundNumber', (req, res) => {
  const db = getDb();
  const { roundNumber } = req.params;
  
  const evaluations = db.prepare(`
    SELECT e.*, t.team_name, t.team_leader, j.name as judge_name
    FROM evaluations e
    JOIN teams t ON e.team_id = t.id
    JOIN judges j ON e.judge_id = j.id
    WHERE e.round_number = ?
    ORDER BY e.total_score DESC
  `).all(roundNumber);
  
  res.json(evaluations);
});

router.get('/team/:teamId', (req, res) => {
  const db = getDb();
  const { teamId } = req.params;
  
  const evaluations = db.prepare(`
    SELECT e.*, j.name as judge_name
    FROM evaluations e
    JOIN judges j ON e.judge_id = j.id
    WHERE e.team_id = ?
    ORDER BY e.round_number DESC, e.evaluated_at DESC
  `).all(teamId);
  
  res.json(evaluations);
});

router.get('/count/:judgeId/:roundNumber', (req, res) => {
  const db = getDb();
  const { judgeId, roundNumber } = req.params;
  
  const result = db.prepare(
    'SELECT COUNT(*) as count FROM evaluations WHERE judge_id = ? AND round_number = ?'
  ).get(judgeId, parseInt(roundNumber));
  
  res.json({
    judgeId,
    roundNumber: parseInt(roundNumber),
    teamsEvaluated: result.count,
    teamsRemaining: MAX_TEAMS_PER_JUDGE_PER_ROUND - result.count
  });
});

router.get('/evaluated-teams/:judgeId/:roundNumber', (req, res) => {
  const db = getDb();
  const { judgeId, roundNumber } = req.params;
  
  const teams = db.prepare(`
    SELECT e.team_id, t.team_name
    FROM evaluations e
    JOIN teams t ON e.team_id = t.id
    WHERE e.judge_id = ? AND e.round_number = ?
  `).all(judgeId, parseInt(roundNumber));
  
  res.json(teams);
});

router.get('/export', (req, res) => {
  const db = getDb();
  const filePath = exportEvaluationsToExcel(db);
  
  if (!filePath) {
    return res.status(404).json({ error: 'No evaluations found to export' });
  }
  
  res.download(filePath, 'evaluations.xlsx');
});

export default router;