import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import os from 'os';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Students ---

app.get('/api/students', (req, res) => {
  const students = db.prepare('SELECT * FROM students').all();
  res.json(students);
});

app.put('/api/students/:roll', (req, res) => {
  const { roll } = req.params;
  const data = req.body;
  
  const columns = Object.keys(data).filter(col => col !== 'roll');
  const values = columns.map(col => data[col]);
  
  const setClause = columns.map(col => `${col} = ?`).join(', ');
  const query = `UPDATE students SET ${setClause} WHERE roll = ?`;
  
  try {
    db.prepare(query).run(...values, roll);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students/bulk', (req, res) => {
  const students = req.body; // Array of student objects
  const insert = db.prepare(`
    INSERT OR REPLACE INTO students (
      roll, name, team, cls, room, phone, parentName, p1, p2, email, 
      backlogs, backlogSubs, laptop, club, abcId, project,
      s11, s12, s21, s22, s31, status
    ) VALUES (
      @roll, @name, @team, @cls, @room, @phone, @parentName, @p1, @p2, @email, 
      @backlogs, @backlogSubs, @laptop, @club, @abcId, @project,
      @s11, @s12, @s21, @s22, @s31, @status
    )
  `);

  const insertMany = db.transaction((list) => {
    for (const student of list) insert.run(student);
  });

  try {
    insertMany(students);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Attendance History ---

app.get('/api/attendance', (req, res) => {
  const history = db.prepare('SELECT * FROM attendance_history').all();
  // Parse JSON report_data
  const parsed = history.reduce((acc, row) => {
    const report = JSON.parse(row.report_data);
    const date = row.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(report);
    return acc;
  }, {});
  res.json(parsed);
});

app.post('/api/attendance', (req, res) => {
  const reportData = req.body;
  const date = reportData.date;
  
  try {
    db.prepare('INSERT INTO attendance_history (date, report_data) VALUES (?, ?)')
      .run(date, JSON.stringify(reportData));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/attendance', (req, res) => {
    try {
        db.prepare('DELETE FROM attendance_history').run();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Settings ---

app.get('/api/settings/:key', (req, res) => {
  const { key } = req.params;

  if (key === 'students') {
    try {
      const rows = db.prepare('SELECT * FROM students').all();
      const mapped = rows.map(s => ({
        ...s,
        id: s.roll
      }));
      return res.json(mapped);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (key === 'studentInfoData') {
    try {
      const rows = db.prepare('SELECT * FROM students').all();
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  res.json(row ? JSON.parse(row.value) : null);
});

app.post('/api/settings/:key', (req, res) => {
  const { key } = req.params;
  
  if (key === 'students' || key === 'studentInfoData') {
    const list = req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ error: 'Payload must be an array' });
    }

    const dbRows = list.map(s => {
      const roll = s.roll || s.id;
      return {
        roll,
        name: s.name || null,
        team: s.team || null,
        cls: s.cls || null,
        room: s.room || null,
        phone: s.phone || null,
        parentName: s.parentName || null,
        p1: s.p1 || null,
        p2: s.p2 || null,
        email: s.email || null,
        backlogs: s.backlogs !== undefined ? s.backlogs : (s.backlogCount !== undefined ? s.backlogCount : 0),
        backlogSubs: s.backlogSubs || null,
        laptop: s.laptop || null,
        club: s.club || null,
        abcId: s.abcId || null,
        project: s.project || null,
        status: s.status !== undefined ? s.status : null,
        s11: s.s11 || null,
        s12: s.s12 || null,
        s21: s.s21 || null,
        s22: s.s22 || null,
        s31: s.s31 || null
      };
    });

    const rollsInPayload = dbRows.map(r => r.roll).filter(Boolean);

    const insert = db.prepare(`
      INSERT OR REPLACE INTO students (
        roll, name, team, cls, room, phone, parentName, p1, p2, email, 
        backlogs, backlogSubs, laptop, club, abcId, project, status,
        s11, s12, s21, s22, s31
      ) VALUES (
        @roll, @name, @team, @cls, @room, @phone, @parentName, @p1, @p2, @email, 
        @backlogs, @backlogSubs, @laptop, @club, @abcId, @project, @status,
        @s11, @s12, @s21, @s22, @s31
      )
    `);

    const transaction = db.transaction((rows) => {
      if (rollsInPayload.length > 0) {
        const placeholders = rollsInPayload.map(() => '?').join(',');
        db.prepare(`DELETE FROM students WHERE roll NOT IN (${placeholders})`).run(...rollsInPayload);
      } else {
        db.prepare(`DELETE FROM students`).run();
      }
      for (const row of rows) {
        insert.run(row);
      }
    });

    try {
      transaction(dbRows);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  const value = JSON.stringify(req.body);
  
  try {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run(key, value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

app.listen(port, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`Server running locally at http://localhost:${port}`);
  console.log(`Access backend on other devices via: http://${localIp}:${port}`);
});
