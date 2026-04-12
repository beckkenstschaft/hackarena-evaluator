import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'backend', 'hackarena.db');

const db = new Database(dbPath);

console.log('Starting database migration...\n');

try {
  db.exec('ALTER TABLE teams ADD COLUMN current_qr_id TEXT');
  console.log('Added current_qr_id column to teams table');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('current_qr_id column already exists');
  } else {
    console.log('Note:', e.message);
  }
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS qr_codes (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      judge_id TEXT,
      scan_time DATETIME,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Created qr_codes table');
} catch (e) {
  if (e.message.includes('already exists')) {
    console.log('qr_codes table already exists');
  } else {
    console.log('Note:', e.message);
  }
}

console.log('\n=== Generating QR IDs for all teams ===\n');

const teams = db.prepare("SELECT id, team_name FROM teams WHERE current_qr_id IS NULL OR current_qr_id = ''").all();
console.log(`Found ${teams.length} teams without QR codes`);

let generated = 0;
let skipped = 0;

for (const team of teams) {
  try {
    const qrId = uuidv4();
    
    db.prepare('INSERT INTO qr_codes (id, team_id, is_active) VALUES (?, ?, 1)')
      .run(qrId, team.id);
    
    db.prepare('UPDATE teams SET current_qr_id = ? WHERE id = ?')
      .run(qrId, team.id);
    
    generated++;
    console.log(`Generated QR for: ${team.team_name} (${qrId.substring(0, 8)}...)`);
  } catch (err) {
    skipped++;
    console.log(`Skipped: ${team.team_name} - ${err.message}`);
  }
}

console.log(`\n=== Migration Complete ===`);
console.log(`Generated: ${generated}`);
console.log(`Skipped: ${skipped}`);

console.log('\n=== Current Stats ===');
const stats = db.prepare(`
  SELECT 
    (SELECT COUNT(*) FROM teams) as total_teams,
    (SELECT COUNT(*) FROM teams WHERE current_qr_id IS NOT NULL AND current_qr_id != '') as teams_with_qr,
    (SELECT COUNT(*) FROM judges) as total_judges,
    (SELECT COUNT(*) FROM evaluations) as total_evaluations
`).get();
console.log(stats);

console.log('\n=== Evaluations Summary ===');
const evals = db.prepare(`
  SELECT j.name as judge_name, t.team_name, e.total_score, e.round_number, e.evaluated_at
  FROM evaluations e
  JOIN judges j ON e.judge_id = j.id
  JOIN teams t ON e.team_id = t.id
  ORDER BY e.evaluated_at DESC
`).all();
evals.forEach(e => {
  console.log(`Judge: ${e.judge_name} | Team: ${e.team_name} | Score: ${e.total_score}/100 | Round: ${e.round_number} | Time: ${e.evaluated_at}`);
});

db.close();
