// api/index.js — Vercel serverless entry point wrapping the Express server
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ strict: false }));

// In-memory fallback store (Vercel has no persistent SQLite)
let students = [];
let courses = [];
let semesters = [
  { key: 's11', label: '1-1' },
  { key: 's12', label: '1-2' },
  { key: 's21', label: '2-1' },
  { key: 's22', label: '2-2' },
  { key: 's31', label: '3-1' }
];
let attendanceHistory = {};
let settings = {};

// Try to import the SQLite DB — will fail gracefully on Vercel
let db = null;
try {
  const mod = await import('../server/db.js');
  db = mod.default;
} catch (e) {
  console.log('SQLite not available, using in-memory store.');
}

const dbGet = (query, params = []) => {
  if (db) return db.prepare(query).all(...params);
  return [];
};

// ─── Students ──────────────────────────────────────────────────────────────

app.get('/api/students', (req, res) => {
  try {
    if (db) {
      const rows = db.prepare('SELECT * FROM students').all();
      return res.json(rows);
    }
    res.json(students);
  } catch (e) {
    res.json(students);
  }
});

app.put('/api/students/:roll', (req, res) => {
  try {
    if (db) {
      const { roll } = req.params;
      const data = req.body;
      const cols = Object.keys(data).filter(k => k !== 'roll');
      if (cols.length > 0) {
        const set = cols.map(c => `${c} = ?`).join(', ');
        db.prepare(`UPDATE students SET ${set} WHERE roll = ?`).run(...cols.map(c => data[c]), roll);
      }
      return res.json({ success: true });
    }
    const idx = students.findIndex(s => s.roll === req.params.roll);
    if (idx !== -1) students[idx] = { ...students[idx], ...req.body };
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/students/bulk', (req, res) => {
  try {
    if (db) {
      const list = req.body;
      const stmt = db.prepare(`INSERT OR REPLACE INTO students (roll,name,team,cls,room,phone,parentName,p1,p2,email,backlogs,backlogSubs,laptop,club,abcId,project,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
      db.transaction(() => {
        for (const s of list) {
          stmt.run(s.roll||s.id,s.name,s.team,s.cls,s.room,s.phone,s.parentName,s.p1,s.p2,s.email,s.backlogs,s.backlogSubs,s.laptop,s.club,s.abcId,s.project,s.status??null);
        }
      })();
      return res.json({ success: true });
    }
    students = req.body;
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Courses ───────────────────────────────────────────────────────────────

app.get('/api/courses', (req, res) => {
  try {
    if (db) return res.json(db.prepare('SELECT * FROM courses ORDER BY code').all());
    res.json(courses);
  } catch (e) { res.json(courses); }
});

app.post('/api/courses', (req, res) => {
  try {
    const { code, name } = req.body;
    if (db) {
      db.prepare('INSERT OR REPLACE INTO courses (code,name) VALUES (?,?)').run(code.trim().toUpperCase(), (name||code).trim());
    } else {
      courses.push({ code: code.trim().toUpperCase(), name: (name||code).trim() });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/courses/:code', (req, res) => {
  try {
    if (db) {
      db.prepare('DELETE FROM courses WHERE code = ?').run(req.params.code.toUpperCase());
    } else {
      courses = courses.filter(c => c.code !== req.params.code.toUpperCase());
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Semesters ─────────────────────────────────────────────────────────────

app.get('/api/semesters', (req, res) => {
  try {
    if (db) return res.json(db.prepare('SELECT * FROM semesters ORDER BY key').all());
    res.json(semesters);
  } catch (e) { res.json(semesters); }
});

app.post('/api/semesters', (req, res) => {
  try {
    const { key, label } = req.body;
    if (db) {
      db.prepare('INSERT OR REPLACE INTO semesters (key,label) VALUES (?,?)').run(key.trim(), label.trim());
    } else {
      semesters.push({ key: key.trim(), label: label.trim() });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/semesters/:key', (req, res) => {
  try {
    if (db) {
      db.prepare('DELETE FROM semesters WHERE key = ?').run(req.params.key);
    } else {
      semesters = semesters.filter(s => s.key !== req.params.key);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Attendance ────────────────────────────────────────────────────────────

app.get('/api/attendance', (req, res) => {
  try {
    if (db) {
      const rows = db.prepare('SELECT * FROM attendance_history').all();
      const parsed = rows.reduce((acc, row) => {
        const report = JSON.parse(row.report_data);
        if (!acc[row.date]) acc[row.date] = [];
        acc[row.date].push(report);
        return acc;
      }, {});
      return res.json(parsed);
    }
    res.json(attendanceHistory);
  } catch (e) { res.json(attendanceHistory); }
});

app.post('/api/attendance', (req, res) => {
  try {
    const reportData = req.body;
    const date = reportData.date;
    if (db) {
      db.prepare('INSERT INTO attendance_history (date,report_data) VALUES (?,?)').run(date, JSON.stringify(reportData));
    } else {
      if (!attendanceHistory[date]) attendanceHistory[date] = [];
      attendanceHistory[date].push(reportData);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/attendance', (req, res) => {
  try {
    if (db) db.prepare('DELETE FROM attendance_history').run();
    else attendanceHistory = {};
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Settings ──────────────────────────────────────────────────────────────

app.get('/api/settings/:key', (req, res) => {
  try {
    if (db) {
      const { key } = req.params;
      if (key === 'students' || key === 'studentInfoData') {
        const rows = db.prepare('SELECT * FROM students').all();
        return res.json(rows.map(s => ({ ...s, id: s.roll })));
      }
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return res.json(row ? JSON.parse(row.value) : null);
    }
    res.json(settings[req.params.key] ?? null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params;
    if (db) {
      if (key === 'students' || key === 'studentInfoData') {
        return res.json({ success: true }); // handled by bulk endpoint
      }
      db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').run(key, JSON.stringify(req.body));
    } else {
      settings[key] = req.body;
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Export for Vercel ─────────────────────────────────────────────────────
export default app;
