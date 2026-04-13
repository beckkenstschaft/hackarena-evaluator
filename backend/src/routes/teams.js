import express from 'express';
import { getDb } from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { exportEvaluationsToExcel } from '../utils/excelExport.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { teamName, teamLeader, teamDetails, teamMembers, contactEmail } = req.body;
  
  if (!teamName || !teamLeader) {
    return res.status(400).json({ error: 'Team name and team leader are required' });
  }

  const trimmedName = teamName.trim();
  const trimmedLeader = teamLeader.trim();
  
  if (!trimmedName || !trimmedLeader) {
    return res.status(400).json({ error: 'Team name and team leader cannot be empty' });
  }

  const db = getDb();
  const id = uuidv4();

  try {
    const stmt = db.prepare(`
      INSERT INTO teams (id, team_name, team_leader, team_details, team_members, contact_email)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, trimmedName, trimmedLeader, teamDetails?.trim() || '', teamMembers?.trim() || '', contactEmail?.trim() || '');
    
    res.status(201).json({ id, teamName: trimmedName, teamLeader: trimmedLeader, teamDetails, teamMembers, contactEmail });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const db = getDb();
  const teams = db.prepare('SELECT * FROM teams ORDER BY created_at DESC').all();
  res.json(teams);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id);
  
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  
  res.json(team);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  
  db.prepare('DELETE FROM evaluations WHERE team_id = ?').run(req.params.id);
  
  const result = db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Team not found' });
  }
  
  exportEvaluationsToExcel(db);
  
  res.json({ message: 'Team deleted successfully' });
});

router.get('/:id/qrcode', async (req, res) => {
  const db = getDb();
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id);
  
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  const baseUrl = req.headers.origin || `http://localhost:${process.env.PORT || 5000}`;
  const qrData = `${baseUrl}/scan?team=${team.id}`;
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    res.json({ qrCode: qrCodeDataUrl, teamId: team.id, teamName: team.team_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;