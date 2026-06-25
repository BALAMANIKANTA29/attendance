import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'attendance.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    owner_email TEXT,
    roll TEXT,
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
    s31 TEXT,
    PRIMARY KEY (owner_email, roll)
  );

  CREATE TABLE IF NOT EXISTS attendance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_email TEXT,
    date TEXT,
    report_data TEXT -- JSON string
  );

  CREATE TABLE IF NOT EXISTS settings (
    owner_email TEXT,
    key TEXT,
    value TEXT, -- JSON string
    PRIMARY KEY (owner_email, key)
  );

  CREATE TABLE IF NOT EXISTS courses (
    owner_email TEXT,
    code TEXT,
    name TEXT,
    PRIMARY KEY (owner_email, code)
  );

  CREATE TABLE IF NOT EXISTS semesters (
    owner_email TEXT,
    key TEXT,
    label TEXT,
    PRIMARY KEY (owner_email, key)
  );

  CREATE TABLE IF NOT EXISTS student_backlogs (
    owner_email TEXT,
    roll TEXT,
    course_code TEXT,
    semester_key TEXT,
    PRIMARY KEY (owner_email, roll, course_code, semester_key)
  );

`);

export default db;
