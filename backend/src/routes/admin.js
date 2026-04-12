import express from 'express';
import { getDb } from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const router = express.Router();

router.get('/stats', (req, res) => {
  const db = getDb();
  
  try {
    const totalTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    const totalJudges = db.prepare('SELECT COUNT(*) as count FROM judges').get().count;
    const totalEvaluations = db.prepare('SELECT COUNT(*) as count FROM evaluations').get().count;
    
    const rounds = db.prepare('SELECT DISTINCT round_number FROM evaluations ORDER BY round_number').all();
    const currentRound = rounds.length > 0 ? Math.max(...rounds.map(r => r.round_number)) : 1;
    
    const roundStats = db.prepare(`
      SELECT 
        round_number,
        COUNT(*) as evaluations,
        AVG(total_score) as avg_score,
        MAX(total_score) as max_score,
        COUNT(DISTINCT team_id) as teams_evaluated
      FROM evaluations
      GROUP BY round_number
    `).all();

    const teamsByRound = db.prepare(`
      SELECT 
        round_number,
        COUNT(DISTINCT team_id) as teams_evaluated
      FROM evaluations
      GROUP BY round_number
    `).all();

    res.json({
      totalTeams,
      totalJudges,
      totalEvaluations,
      currentRound,
      roundStats,
      teamsByRound
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/judge-stats', (req, res) => {
  const db = getDb();
  
  try {
    const stats = db.prepare(`
      SELECT 
        j.id,
        j.name,
        COUNT(e.id) as evaluations_count,
        COALESCE(MAX(e.round_number), 0) as last_round
      FROM judges j
      LEFT JOIN evaluations e ON j.id = e.judge_id
      GROUP BY j.id
      ORDER BY evaluations_count DESC
    `).all();

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/judge/:judgeId/activity', (req, res) => {
  const db = getDb();
  const { judgeId } = req.params;
  
  try {
    const scans = db.prepare(`
      SELECT 
        q.id,
        q.scan_time,
        q.team_id,
        t.team_name,
        t.team_leader
      FROM qr_codes q
      JOIN teams t ON q.team_id = t.id
      WHERE q.judge_id = ?
      ORDER BY q.scan_time DESC
    `).all(judgeId);

    const evaluations = db.prepare(`
      SELECT 
        e.*,
        t.team_name,
        t.team_leader
      FROM evaluations e
      JOIN teams t ON e.team_id = t.id
      WHERE e.judge_id = ?
      ORDER BY e.evaluated_at DESC
    `).all(judgeId);

    res.json({ scans, evaluations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/scan-activity', (req, res) => {
  const db = getDb();
  
  try {
    let activity = [];
    
    try {
      activity = db.prepare(`
        SELECT 
          q.id,
          q.scan_time,
          q.team_id,
          t.team_name,
          t.team_leader,
          j.id as judge_id,
          j.name as judge_name,
          e.id as evaluation_id,
          e.total_score
        FROM qr_codes q
        JOIN teams t ON q.team_id = t.id
        LEFT JOIN judges j ON q.judge_id = j.id
        LEFT JOIN evaluations e ON q.team_id = e.team_id AND q.judge_id = e.judge_id
        ORDER BY q.scan_time DESC
        LIMIT 100
      `).all();
    } catch (e) {
      console.log('QR scans table empty or error:', e.message);
    }

    if (activity.length === 0) {
      activity = db.prepare(`
        SELECT 
          e.id,
          e.evaluated_at as scan_time,
          e.team_id,
          t.team_name,
          t.team_leader,
          e.judge_id,
          j.name as judge_name,
          e.id as evaluation_id,
          e.total_score
        FROM evaluations e
        JOIN teams t ON e.team_id = t.id
        JOIN judges j ON e.judge_id = j.id
        ORDER BY e.evaluated_at DESC
        LIMIT 100
      `).all();
    }

    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/scan/:qrId', (req, res) => {
  const db = getDb();
  const { qrId } = req.params;
  const { judgeId } = req.body;
  
  if (!judgeId) {
    return res.status(400).json({ error: 'Judge ID is required' });
  }

  try {
    const qr = db.prepare('SELECT * FROM qr_codes WHERE id = ?').get(qrId);
    
    if (!qr) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    if (!qr.is_active) {
      return res.status(400).json({ error: 'This QR code has been discontinued' });
    }

    db.prepare('UPDATE qr_codes SET judge_id = ?, scan_time = CURRENT_TIMESTAMP WHERE id = ?')
      .run(judgeId, qrId);

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(qr.team_id);
    const judge = db.prepare('SELECT * FROM judges WHERE id = ?').get(judgeId);

    res.json({
      success: true,
      team,
      judge,
      qrId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teams/:teamId/regenerate-qr', async (req, res) => {
  const db = getDb();
  const { teamId } = req.params;
  const baseUrl = req.body.baseUrl || `http://localhost:${process.env.PORT || 5000}`;

  try {
    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    db.prepare('UPDATE qr_codes SET is_active = 0 WHERE team_id = ?').run(teamId);

    const newQrId = uuidv4();
    const qrData = `${baseUrl}/scan?qr=${newQrId}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });

    db.prepare('INSERT INTO qr_codes (id, team_id, is_active) VALUES (?, ?, 1)')
      .run(newQrId, teamId);

    db.prepare('UPDATE teams SET current_qr_id = ? WHERE id = ?')
      .run(newQrId, teamId);

    res.json({
      qrId: newQrId,
      qrCode: qrCodeDataUrl,
      teamName: team.team_name,
      previousQrDiscontinued: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teams/:teamId/generate-qr', async (req, res) => {
  const db = getDb();
  const { teamId } = req.params;
  const baseUrl = req.body.baseUrl || `http://localhost:${process.env.PORT || 5000}`;

  try {
    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.current_qr_id) {
      return res.status(400).json({ error: 'QR code already exists. Use regenerate to create a new one.' });
    }

    const qrId = uuidv4();
    const qrData = `${baseUrl}/scan?qr=${qrId}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });

    db.prepare('INSERT INTO qr_codes (id, team_id, is_active) VALUES (?, ?, 1)')
      .run(qrId, teamId);

    db.prepare('UPDATE teams SET current_qr_id = ? WHERE id = ?')
      .run(qrId, teamId);

    res.json({
      qrId,
      qrCode: qrCodeDataUrl,
      teamName: team.team_name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teams/:teamId/qr-status', (req, res) => {
  const db = getDb();
  const { teamId } = req.params;

  try {
    const qrs = db.prepare(`
      SELECT 
        q.*,
        j.name as judge_name,
        j.id as scanned_by_judge_id
      FROM qr_codes q
      LEFT JOIN judges j ON q.judge_id = j.id
      WHERE q.team_id = ?
      ORDER BY q.created_at DESC
    `).all(teamId);

    res.json(qrs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
