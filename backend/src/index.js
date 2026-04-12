import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, closeDb } from './database.js';
import teamsRouter from './routes/teams.js';
import judgesRouter from './routes/judges.js';
import evaluationsRouter from './routes/evaluations.js';
import adminRouter from './routes/admin.js';
import { exportEvaluationsToExcel } from './utils/excelExport.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';
const CERT_PATH = process.env.CERT_PATH || path.join(__dirname, '..', 'certificates');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'HackArena Scanner API', version: '1.0.0', protocol: USE_HTTPS ? 'https' : 'http' });
});

app.get('/health', (req, res) => {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', database: 'connected', protocol: USE_HTTPS ? 'https' : 'http' });
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

const db = getDb();
exportEvaluationsToExcel(db);

if (USE_HTTPS) {
  const httpsOptions = {
    key: fs.readFileSync(path.join(CERT_PATH, 'server.key')),
    cert: fs.readFileSync(path.join(CERT_PATH, 'server.crt')),
    passphrase: 'changeit'
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server running on https://localhost:${PORT}`);
  });

  http.createServer((req, res) => {
    res.writeHead(301, { 'Location': `https://localhost:${PORT}${req.url}` });
    res.end();
  }).listen(80, () => {
    console.log('HTTP redirect server running on port 80');
  });
} else {
  app.listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
  });
}

process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});
