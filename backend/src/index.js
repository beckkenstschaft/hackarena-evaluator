import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb, closeDb } from './database.js';
import teamsRouter from './routes/teams.js';
import judgesRouter from './routes/judges.js';
import evaluationsRouter from './routes/evaluations.js';
import adminRouter from './routes/admin.js';
import { exportEvaluationsToExcel } from './utils/excelExport.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'HackArena Scanner API', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

app.use('/api/teams', teamsRouter);
app.use('/api/judges', judgesRouter);
app.use('/api/evaluations', evaluationsRouter);
app.use('/api/admin', adminRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  const db = getDb();
  exportEvaluationsToExcel(db);
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});