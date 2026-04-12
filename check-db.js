import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'backend', 'hackarena.db');

const db = new Database(dbPath);

console.log('=== TEAMS COUNT ===');
const teamsCount = db.prepare('SELECT COUNT(*) as count FROM teams').get();
console.log(teamsCount);

console.log('\n=== JUDGES ===');
const judges = db.prepare('SELECT * FROM judges').all();
console.log(judges);

console.log('\n=== EVALUATIONS ===');
const evals = db.prepare(`
  SELECT e.*, t.team_name, j.name as judge_name 
  FROM evaluations e 
  JOIN teams t ON e.team_id = t.id 
  JOIN judges j ON e.judge_id = j.id
`).all();
console.log(evals);

console.log('\n=== QR_CODES ===');
const qrs = db.prepare('SELECT * FROM qr_codes').all();
console.log(qrs);

console.log('\n=== TEAMS WITH QR STATUS ===');
const teamsWithQR = db.prepare('SELECT id, team_name, current_qr_id FROM teams').all();
console.log(teamsWithQR);

db.close();
