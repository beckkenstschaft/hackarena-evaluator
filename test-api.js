import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'backend', 'hackarena.db');

const db = new Database(dbPath);

console.log('=== API Endpoints Test ===\n');

console.log('1. Stats:');
const stats = {
  totalTeams: db.prepare('SELECT COUNT(*) as count FROM teams').get().count,
  totalJudges: db.prepare('SELECT COUNT(*) as count FROM judges').get().count,
  totalEvaluations: db.prepare('SELECT COUNT(*) as count FROM evaluations').get().count
};
console.log(stats);

console.log('\n2. Judge Stats:');
const judgeStats = db.prepare(`
  SELECT j.id, j.name, COUNT(e.id) as evaluations_count, COALESCE(MAX(e.round_number), 0) as last_round
  FROM judges j
  LEFT JOIN evaluations e ON j.id = e.judge_id
  GROUP BY j.id
`).all();
console.log(judgeStats);

console.log('\n3. Evaluations (GET /api/evaluations):');
const evaluations = db.prepare(`
  SELECT e.*, t.team_name, t.team_leader, j.name as judge_name
  FROM evaluations e
  JOIN teams t ON e.team_id = t.id
  JOIN judges j ON e.judge_id = j.id
  ORDER BY e.evaluated_at DESC
`).all();
console.log(evaluations);

console.log('\n4. Teams with QR:');
const teamsQR = db.prepare('SELECT id, team_name, team_leader, current_qr_id FROM teams LIMIT 5').all();
console.log(teamsQR);

db.close();
console.log('\n=== Database synced correctly ===');
