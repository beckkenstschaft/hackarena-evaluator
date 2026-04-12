import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', process.env.DATABASE_NAME || 'hackarena.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      team_name TEXT NOT NULL UNIQUE,
      team_leader TEXT NOT NULL,
      team_details TEXT,
      team_members TEXT,
      contact_email TEXT,
      current_qr_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS judges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      judge_id TEXT NOT NULL,
      round_number INTEGER NOT NULL DEFAULT 1,
      novelty INTEGER NOT NULL CHECK(novelty >= 0 AND novelty <= 20),
      usage_score INTEGER NOT NULL CHECK(usage_score >= 0 AND usage_score <= 20),
      methodology INTEGER NOT NULL CHECK(methodology >= 0 AND methodology <= 20),
      presentation INTEGER NOT NULL CHECK(presentation >= 0 AND presentation <= 20),
      uniqueness INTEGER NOT NULL CHECK(uniqueness >= 0 AND uniqueness <= 20),
      total_score INTEGER NOT NULL,
      remarks TEXT DEFAULT 'NA',
      evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (judge_id) REFERENCES judges(id),
      UNIQUE(team_id, judge_id, round_number)
    );

    CREATE TABLE IF NOT EXISTS qr_codes (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      judge_id TEXT,
      scan_time DATETIME,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (judge_id) REFERENCES judges(id)
    );

    CREATE INDEX IF NOT EXISTS idx_evaluations_team ON evaluations(team_id);
    CREATE INDEX IF NOT EXISTS idx_evaluations_judge ON evaluations(judge_id);
    CREATE INDEX IF NOT EXISTS idx_evaluations_round ON evaluations(round_number);
    CREATE INDEX IF NOT EXISTS idx_qr_codes_team ON qr_codes(team_id);
    CREATE INDEX IF NOT EXISTS idx_qr_codes_judge ON qr_codes(judge_id);
  `);

  console.log('Database initialized successfully');
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}