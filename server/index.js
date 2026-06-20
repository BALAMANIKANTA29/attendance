import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import os from 'os';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ strict: false }));

// Helper to dynamically attach student backlogs from student_backlogs table
const getBacklogsGroupedByStudent = (studentsList) => {
  const backlogs = db.prepare('SELECT * FROM student_backlogs').all();
  let sems = db.prepare('SELECT * FROM semesters').all();
  if (sems.length === 0) {
    sems = [
      { key: 's11', label: '1-1' },
      { key: 's12', label: '1-2' },
      { key: 's21', label: '2-1' },
      { key: 's22', label: '2-2' },
      { key: 's31', label: '3-1' }
    ];
  }
  
  const studentBacklogMap = {};
  for (const b of backlogs) {
    if (!studentBacklogMap[b.roll]) {
      studentBacklogMap[b.roll] = {};
    }
    if (!studentBacklogMap[b.roll][b.semester_key]) {
      studentBacklogMap[b.roll][b.semester_key] = [];
    }
    studentBacklogMap[b.roll][b.semester_key].push(b.course_code.toUpperCase());
  }

  return studentsList.map(s => {
    const roll = s.roll;
    const backlogMap = studentBacklogMap[roll] || {};
    
    const updatedStudent = { ...s };
    
    const allSubs = [];
    for (const sem of sems) {
      const subs = backlogMap[sem.key] || [];
      updatedStudent[sem.key] = subs.join(',');
      allSubs.push(...subs);
    }
    
    updatedStudent.backlogs = allSubs.length;
    updatedStudent.backlogSubs = allSubs.join(',');
    
    return updatedStudent;
  });
};

// --- Students ---

app.get('/api/students', (req, res) => {
  try {
    const students = db.prepare('SELECT * FROM students').all();
    const mapped = getBacklogsGroupedByStudent(students);
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/students/:roll', (req, res) => {
  const { roll } = req.params;
  const data = { ...req.body };
  
  let sems = db.prepare('SELECT key FROM semesters').all().map(s => s.key);
  if (sems.length === 0) {
    sems = ['s11', 's12', 's21', 's22', 's31'];
  }
  
  try {
    db.transaction(() => {
      db.prepare('DELETE FROM student_backlogs WHERE roll = ?').run(roll);
      
      const allSubs = [];
      const insertBacklog = db.prepare('INSERT OR REPLACE INTO student_backlogs (roll, course_code, semester_key) VALUES (?, ?, ?)');
      
      for (const semKey of sems) {
        if (data[semKey] !== undefined) {
          const val = String(data[semKey] || '').trim();
          const subs = val.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
          for (const sub of subs) {
            db.prepare('INSERT OR IGNORE INTO courses (code, name) VALUES (?, ?)').run(sub, sub);
            insertBacklog.run(roll, sub, semKey);
            allSubs.push(sub);
          }
        }
      }
      
      data.backlogs = allSubs.length;
      data.backlogSubs = allSubs.join(',');

      const studentsColumns = [
        'name', 'team', 'cls', 'room', 'phone', 'parentName', 'p1', 'p2', 'email', 
        'backlogs', 'backlogSubs', 'laptop', 'club', 'abcId', 'project', 'status'
      ];
      
      const updateData = {};
      for (const col of studentsColumns) {
        if (data[col] !== undefined) {
          updateData[col] = data[col];
        }
      }

      const columns = Object.keys(updateData);
      const values = columns.map(col => updateData[col]);
      
      if (columns.length > 0) {
        const setClause = columns.map(col => `${col} = ?`).join(', ');
        const query = `UPDATE students SET ${setClause} WHERE roll = ?`;
        db.prepare(query).run(...values, roll);
      }
    })();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students/bulk', (req, res) => {
  const students = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Payload must be an array' });
  }

  let sems = db.prepare('SELECT key FROM semesters').all().map(s => s.key);
  if (sems.length === 0) {
    sems = ['s11', 's12', 's21', 's22', 's31'];
  }

  try {
    db.transaction(() => {
      const insertStudent = db.prepare(`
        INSERT OR REPLACE INTO students (
          roll, name, team, cls, room, phone, parentName, p1, p2, email, 
          backlogs, backlogSubs, laptop, club, abcId, project, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertBacklog = db.prepare('INSERT OR REPLACE INTO student_backlogs (roll, course_code, semester_key) VALUES (?, ?, ?)');

      for (const s of students) {
        const roll = s.roll || s.id;
        if (!roll) continue;

        db.prepare('DELETE FROM student_backlogs WHERE roll = ?').run(roll);

        const allSubs = [];
        for (const semKey of sems) {
          if (s[semKey] !== undefined) {
            const val = String(s[semKey] || '').trim();
            const subs = val.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
            for (const sub of subs) {
              db.prepare('INSERT OR IGNORE INTO courses (code, name) VALUES (?, ?)').run(sub, sub);
              insertBacklog.run(roll, sub, semKey);
              allSubs.push(sub);
            }
          }
        }

        insertStudent.run(
          roll,
          s.name || null,
          s.team || null,
          s.cls || null,
          s.room || null,
          s.phone || null,
          s.parentName || null,
          s.p1 || null,
          s.p2 || null,
          s.email || null,
          allSubs.length,
          allSubs.join(','),
          s.laptop || null,
          s.club || null,
          s.abcId || null,
          s.project || null,
          s.status !== undefined ? s.status : null
        );
      }
    })();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Courses Catalog ---
app.get('/api/courses', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM courses ORDER BY code ASC').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/courses', (req, res) => {
  const { code, name } = req.body;
  if (!code) return res.status(400).json({ error: 'Course code is required' });
  try {
    db.prepare('INSERT OR REPLACE INTO courses (code, name) VALUES (?, ?)')
      .run(code.trim().toUpperCase(), (name || code).trim());
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/courses/:code', (req, res) => {
  const { code } = req.params;
  try {
    db.transaction(() => {
      db.prepare('DELETE FROM courses WHERE code = ?').run(code.toUpperCase());
      db.prepare('DELETE FROM student_backlogs WHERE course_code = ?').run(code.toUpperCase());
    })();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Semesters ---
app.get('/api/semesters', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM semesters ORDER BY key ASC').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/semesters', (req, res) => {
  const { key, label } = req.body;
  if (!key || !label) return res.status(400).json({ error: 'Semester key and label are required' });
  try {
    db.prepare('INSERT OR REPLACE INTO semesters (key, label) VALUES (?, ?)')
      .run(key.trim().toLowerCase(), label.trim());
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/semesters/:key', (req, res) => {
  const { key } = req.params;
  try {
    db.transaction(() => {
      db.prepare('DELETE FROM semesters WHERE key = ?').run(key.toLowerCase());
      db.prepare('DELETE FROM student_backlogs WHERE semester_key = ?').run(key.toLowerCase());
    })();
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
      const enriched = getBacklogsGroupedByStudent(rows);
      const mapped = enriched.map(s => ({
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
      const enriched = getBacklogsGroupedByStudent(rows);
      return res.json(enriched);
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

    let sems = db.prepare('SELECT key FROM semesters').all().map(s => s.key);
    if (sems.length === 0) {
      sems = ['s11', 's12', 's21', 's22', 's31'];
    }

    const rollsInPayload = list.map(s => s.roll || s.id).filter(Boolean);

    try {
      db.transaction(() => {
        if (rollsInPayload.length > 0) {
          const placeholders = rollsInPayload.map(() => '?').join(',');
          db.prepare(`DELETE FROM students WHERE roll NOT IN (${placeholders})`).run(...rollsInPayload);
          db.prepare(`DELETE FROM student_backlogs WHERE roll NOT IN (${placeholders})`).run(...rollsInPayload);
        } else {
          db.prepare(`DELETE FROM students`).run();
          db.prepare(`DELETE FROM student_backlogs`).run();
        }

        const insertStudent = db.prepare(`
          INSERT OR REPLACE INTO students (
            roll, name, team, cls, room, phone, parentName, p1, p2, email, 
            backlogs, backlogSubs, laptop, club, abcId, project, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertBacklog = db.prepare('INSERT OR REPLACE INTO student_backlogs (roll, course_code, semester_key) VALUES (?, ?, ?)');

        for (const s of list) {
          const roll = s.roll || s.id;
          if (!roll) continue;

          const allSubs = [];
          for (const semKey of sems) {
            if (s[semKey] !== undefined) {
              const val = String(s[semKey] || '').trim();
              const subs = val.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
              for (const sub of subs) {
                db.prepare('INSERT OR IGNORE INTO courses (code, name) VALUES (?, ?)').run(sub, sub);
                insertBacklog.run(roll, sub, semKey);
                allSubs.push(sub);
              }
            }
          }

          insertStudent.run(
            roll,
            s.name || null,
            s.team || null,
            s.cls || null,
            s.room || null,
            s.phone || null,
            s.parentName || null,
            s.p1 || null,
            s.p2 || null,
            s.email || null,
            allSubs.length,
            allSubs.join(','),
            s.laptop || null,
            s.club || null,
            s.abcId || null,
            s.project || null,
            s.status !== undefined ? s.status : null
          );
        }
      })();
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
