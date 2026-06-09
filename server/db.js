import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'attendance.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    roll TEXT PRIMARY KEY,
    name TEXT,
    team TEXT,
    cls TEXT,
    room TEXT,
    phone TEXT,
    parentName TEXT,
    p1 TEXT,
    p2 TEXT,
    email TEXT,
    backlogs INTEGER DEFAULT 0,
    backlogSubs TEXT,
    laptop TEXT,
    club TEXT,
    abcId TEXT,
    project TEXT,
    status TEXT,
    s11 TEXT,
    s12 TEXT,
    s21 TEXT,
    s22 TEXT,
    s31 TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    report_data TEXT -- JSON string
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT -- JSON string
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE,
    expires_at TEXT,
    last_access TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
