import express from 'express';
import { getDb } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Judge name is required' });
  }

  const trimmedName = name.trim();
  const db = getDb();
  const id = uuidv4();

  try {
    const stmt = db.prepare('INSERT INTO judges (id, name) VALUES (?, ?)');
    stmt.run(id, trimmedName);
    
    res.status(201).json({ id, name: trimmedName });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Judge name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const db = getDb();
  const judges = db.prepare('SELECT * FROM judges ORDER BY name ASC').all();
  res.json(judges);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM judges WHERE id = ?').run(req.params.id);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Judge not found' });
  }
  
  res.json({ message: 'Judge deleted successfully' });
});

export default router;