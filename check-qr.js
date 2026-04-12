import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'backend', 'hackarena.db');

const db = new Database(dbPath);

console.log('=== QR Codes Sample ===\n');
const qrs = db.prepare('SELECT id, team_id, is_active FROM qr_codes LIMIT 5').all();
console.log('Sample QR codes:');
qrs.forEach(q => {
  console.log(`  ID: ${q.id}`);
  console.log(`  Team ID: ${q.team_id}`);
  console.log(`  Active: ${q.is_active}`);
  console.log('');
});

console.log('=== Teams with QR ===\n');
const teams = db.prepare(`
  SELECT t.id, t.team_name, t.current_qr_id 
  FROM teams t 
  WHERE t.current_qr_id IS NOT NULL 
  LIMIT 3
`).all();
teams.forEach(t => {
  console.log(`Team: ${t.team_name}`);
  console.log(`  Team ID: ${t.id}`);
  console.log(`  QR ID: ${t.current_qr_id}`);
  console.log('');
});

db.close();
