import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ strict: false }));

// Try to import the SQLite DB — will fail gracefully on Vercel
let db = null;
try {
  const mod = await import('../server/db.js');
  db = mod.default;
} catch (e) {
  console.log('SQLite not available, using in-memory store.');
}

// In-memory fallback store structure partitioned by ownerEmail
const defaultSemesters = [
  { key: 's11', label: '1-1' },
  { key: 's12', label: '1-2' },
  { key: 's21', label: '2-1' },
  { key: 's22', label: '2-2' },
  { key: 's31', label: '3-1' }
];

let defaultStudentInfoData = [];
try {
  const mod = await import('../src/data/studentInfoData.js');
  defaultStudentInfoData = mod.studentInfoData;
} catch (e) {
  console.log('Fallback data import failed.');
}

const owners = ['k12aidha@example.com', 'bmk@example.com'];
let students = {};
let courses = {};
let semesters = {};
let attendanceHistory = {};
let settings = {};

owners.forEach(owner => {
  students[owner] = defaultStudentInfoData.map(s => ({ ...s, id: s.roll }));
  semesters[owner] = [...defaultSemesters];
  courses[owner] = [];
  attendanceHistory[owner] = {};
  settings[owner] = {
    classInfo: { name: 'K12AIDHA', semester: 'Fall', academicYear: '' },
    attendancePolicy: { minimumAttendance: 75, warningThreshold: 60, semesterStartMonth: 1, semesterEndMonth: 6 },
    semesters: defaultSemesters
  };
});

const getContextInfo = (req) => {
  const userEmail = req.headers['x-user-email'] || '';
  
  if (db) {
    const student = db.prepare('SELECT owner_email, roll, name, team FROM students WHERE LOWER(email) = LOWER(?) LIMIT 1').get(userEmail);
    if (student) {
      return {
        isStudent: true,
        userEmail: userEmail,
        ownerEmail: student.owner_email,
        studentRoll: student.roll,
        studentName: student.name,
        studentTeam: student.team
      };
    }
  } else {
    for (const owner of Object.keys(students)) {
      const student = (students[owner] || []).find(s => (s.email || '').toLowerCase() === userEmail.toLowerCase());
      if (student) {
        return {
          isStudent: true,
          userEmail: userEmail,
          ownerEmail: owner,
          studentRoll: student.roll || student.id,
          studentName: student.name,
          studentTeam: student.team
        };
      }
    }
  }
  
  return {
    isStudent: false,
    userEmail: userEmail,
    ownerEmail: userEmail,
    studentRoll: null,
    studentName: null,
    studentTeam: null
  };
};

const getBacklogsGroupedByStudent = (studentsList, ownerEmail) => {
  if (db) {
    const backlogs = db.prepare('SELECT * FROM student_backlogs WHERE owner_email = ?').all(ownerEmail);
    let sems = db.prepare('SELECT * FROM semesters WHERE owner_email = ?').all(ownerEmail);
    if (sems.length === 0) {
      sems = defaultSemesters;
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
  }
  return studentsList;
};

// --- Authentication ---
app.post('/api/auth/login', (req, res) => {
  const { credential, password } = req.body;
  if (!credential || !password) {
    return res.status(400).json({ error: 'Credential and password are required' });
  }

  const id = credential.trim();
  const pass = password.trim();

  if (id === 'BMK' && pass === 'Bala') {
    return res.json({ success: true, role: 'admin', email: 'bmk@example.com', name: 'Super Admin' });
  }

  if (id.toUpperCase() === 'K12AIDHA' && pass === 'k12AIDHA') {
    return res.json({ success: true, role: 'classAdmin', email: 'k12aidha@example.com', name: 'Class Admin' });
  }

  const idClean = id.toLowerCase();
  const passClean = pass.toLowerCase();

  if (db) {
    const student = db.prepare('SELECT * FROM students WHERE LOWER(roll) = ? OR LOWER(email) = ? LIMIT 1').get(idClean, idClean);
    if (student) {
      const matchRoll = (student.roll || '').toLowerCase();
      const matchEmail = (student.email || '').toLowerCase();
      if (passClean === matchRoll || passClean === matchEmail) {
        return res.json({ success: true, role: 'student', email: student.email, roll: student.roll, name: student.name });
      }
    }
  } else {
    for (const owner of Object.keys(students)) {
      const student = (students[owner] || []).find(s => (s.roll || s.id || '').toLowerCase() === idClean || (s.email || '').toLowerCase() === idClean);
      if (student) {
        const matchRoll = (student.roll || student.id || '').toLowerCase();
        const matchEmail = (student.email || '').toLowerCase();
        if (passClean === matchRoll || passClean === matchEmail) {
          return res.json({ success: true, role: 'student', email: student.email, roll: student.roll || student.id, name: student.name });
        }
      }
    }
  }

  const cleanId = id.replace(/[\s-]/g, '');
  const cleanPass = pass.replace(/[\s-]/g, '');
  if (cleanId === cleanPass && cleanId.length >= 10) {
    if (db) {
      const parentMatch = db.prepare("SELECT * FROM students WHERE REPLACE(REPLACE(p1, ' ', ''), '-', '') = ? OR REPLACE(REPLACE(p2, ' ', ''), '-', '') = ? LIMIT 1").get(cleanId, cleanId);
      if (parentMatch) {
        return res.json({ success: true, role: 'parent', email: parentMatch.email, roll: parentMatch.roll, name: parentMatch.name });
      }
    } else {
      for (const owner of Object.keys(students)) {
        const parentMatch = (students[owner] || []).find(s => {
          const p1 = (s.p1 || '').replace(/[\s-]/g, '');
          const p2 = (s.p2 || '').replace(/[\s-]/g, '');
          return (p1 && p1 === cleanId) || (p2 && p2 === cleanId);
        });
        if (parentMatch) {
          return res.json({ success: true, role: 'parent', email: parentMatch.email, roll: parentMatch.roll || parentMatch.id, name: parentMatch.name });
        }
      }
    }
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// --- Students ---

app.get('/api/students', (req, res) => {
  try {
    const context = getContextInfo(req);
    if (db) {
      let rows;
      if (context.isStudent) {
        rows = db.prepare('SELECT * FROM students WHERE owner_email = ? AND LOWER(email) = LOWER(?)').all(context.ownerEmail, context.userEmail);
      } else {
        rows = db.prepare('SELECT * FROM students WHERE owner_email = ?').all(context.ownerEmail);
      }
      return res.json(getBacklogsGroupedByStudent(rows, context.ownerEmail));
    }
    
    let list = students[context.ownerEmail] || [];
    if (context.isStudent) {
      list = list.filter(s => (s.email || '').toLowerCase() === context.userEmail.toLowerCase());
    }
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/students/:roll', (req, res) => {
  try {
    const { roll } = req.params;
    const context = getContextInfo(req);
    const data = req.body;

    if (context.isStudent && roll.toLowerCase() !== context.studentRoll.toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (db) {
      let sems = db.prepare('SELECT key FROM semesters WHERE owner_email = ?').all(context.ownerEmail).map(s => s.key);
      if (sems.length === 0) sems = ['s11', 's12', 's21', 's22', 's31'];

      db.transaction(() => {
        db.prepare('DELETE FROM student_backlogs WHERE owner_email = ? AND roll = ?').run(context.ownerEmail, roll);
        
        const allSubs = [];
        const insertBacklog = db.prepare('INSERT OR REPLACE INTO student_backlogs (owner_email, roll, course_code, semester_key) VALUES (?, ?, ?, ?)');
        
        for (const semKey of sems) {
          if (data[semKey] !== undefined) {
            const val = String(data[semKey] || '').trim();
            const subs = val.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
            for (const sub of subs) {
              db.prepare('INSERT OR IGNORE INTO courses (owner_email, code, name) VALUES (?, ?, ?)').run(context.ownerEmail, sub, sub);
              insertBacklog.run(context.ownerEmail, roll, sub, semKey);
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
          db.prepare(`UPDATE students SET ${setClause} WHERE owner_email = ? AND roll = ?`).run(...values, context.ownerEmail, roll);
        }
      })();
      return res.json({ success: true });
    }

    if (!students[context.ownerEmail]) {
      students[context.ownerEmail] = [];
    }
    const idx = students[context.ownerEmail].findIndex(s => (s.roll || s.id || '').toUpperCase() === roll.toUpperCase());
    if (idx !== -1) {
      students[context.ownerEmail][idx] = { ...students[context.ownerEmail][idx], ...data };
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/students/bulk', (req, res) => {
  try {
    const context = getContextInfo(req);
    if (context.isStudent) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const payload = req.body;
    if (db) {
      let sems = db.prepare('SELECT key FROM semesters WHERE owner_email = ?').all(context.ownerEmail).map(s => s.key);
      if (sems.length === 0) sems = ['s11', 's12', 's21', 's22', 's31'];

      db.transaction(() => {
        db.prepare('DELETE FROM students WHERE owner_email = ?').run(context.ownerEmail);
        db.prepare('DELETE FROM student_backlogs WHERE owner_email = ?').run(context.ownerEmail);

        const insertStudent = db.prepare(`
          INSERT OR REPLACE INTO students (
            owner_email, roll, name, team, cls, room, phone, parentName, p1, p2, email, 
            backlogs, backlogSubs, laptop, club, abcId, project, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertBacklog = db.prepare('INSERT OR REPLACE INTO student_backlogs (owner_email, roll, course_code, semester_key) VALUES (?, ?, ?, ?)');

        for (const s of payload) {
          const roll = s.roll || s.id;
          if (!roll) continue;

          const allSubs = [];
          for (const semKey of sems) {
            if (s[semKey] !== undefined) {
              const val = String(s[semKey] || '').trim();
              const subs = val.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
              for (const sub of subs) {
                db.prepare('INSERT OR IGNORE INTO courses (owner_email, code, name) VALUES (?, ?, ?)').run(context.ownerEmail, sub, sub);
                insertBacklog.run(context.ownerEmail, roll, sub, semKey);
                allSubs.push(sub);
              }
            }
          }

          insertStudent.run(
            context.ownerEmail,
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
    }

    students[context.ownerEmail] = payload.map(s => ({ ...s, id: s.roll || s.id }));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Courses ---

app.get('/api/courses', (req, res) => {
  try {
    const context = getContextInfo(req);
    if (db) return res.json(db.prepare('SELECT * FROM courses WHERE owner_email = ? ORDER BY code').all(context.ownerEmail));
    res.json(courses[context.ownerEmail] || []);
  } catch (e) { res.json([]); }
});

app.post('/api/courses', (req, res) => {
  try {
    const { code, name } = req.body;
    const context = getContextInfo(req);
    if (context.isStudent) return res.status(403).json({ error: 'Forbidden' });

    if (db) {
      db.prepare('INSERT OR REPLACE INTO courses (owner_email, code, name) VALUES (?, ?, ?)')
        .run(context.ownerEmail, code.trim().toUpperCase(), (name||code).trim());
    } else {
      if (!courses[context.ownerEmail]) courses[context.ownerEmail] = [];
      courses[context.ownerEmail] = courses[context.ownerEmail].filter(c => c.code !== code.trim().toUpperCase());
      courses[context.ownerEmail].push({ code: code.trim().toUpperCase(), name: (name||code).trim() });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/courses/:code', (req, res) => {
  try {
    const { code } = req.params;
    const context = getContextInfo(req);
    if (context.isStudent) return res.status(403).json({ error: 'Forbidden' });

    if (db) {
      db.prepare('DELETE FROM courses WHERE owner_email = ? AND code = ?').run(context.ownerEmail, code.toUpperCase());
    } else {
      if (courses[context.ownerEmail]) {
        courses[context.ownerEmail] = courses[context.ownerEmail].filter(c => c.code !== code.toUpperCase());
      }
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Semesters ---

app.get('/api/semesters', (req, res) => {
  try {
    const context = getContextInfo(req);
    if (db) return res.json(db.prepare('SELECT * FROM semesters WHERE owner_email = ? ORDER BY key').all(context.ownerEmail));
    res.json(semesters[context.ownerEmail] || []);
  } catch (e) { res.json([]); }
});

app.post('/api/semesters', (req, res) => {
  try {
    const { key, label } = req.body;
    const context = getContextInfo(req);
    if (context.isStudent) return res.status(403).json({ error: 'Forbidden' });

    if (db) {
      db.prepare('INSERT OR REPLACE INTO semesters (owner_email, key, label) VALUES (?, ?, ?)').run(context.ownerEmail, key.trim(), label.trim());
    } else {
      if (!semesters[context.ownerEmail]) semesters[context.ownerEmail] = [];
      semesters[context.ownerEmail] = semesters[context.ownerEmail].filter(s => s.key !== key.trim());
      semesters[context.ownerEmail].push({ key: key.trim(), label: label.trim() });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/semesters/:key', (req, res) => {
  try {
    const { key } = req.params;
    const context = getContextInfo(req);
    if (context.isStudent) return res.status(403).json({ error: 'Forbidden' });

    if (db) {
      db.prepare('DELETE FROM semesters WHERE owner_email = ? AND key = ?').run(context.ownerEmail, key);
    } else {
      if (semesters[context.ownerEmail]) {
        semesters[context.ownerEmail] = semesters[context.ownerEmail].filter(s => s.key !== key);
      }
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Attendance ---

app.get('/api/attendance', (req, res) => {
  try {
    const context = getContextInfo(req);
    let hist = {};

    if (db) {
      const rows = db.prepare('SELECT * FROM attendance_history WHERE owner_email = ?').all(context.ownerEmail);
      hist = rows.reduce((acc, row) => {
        const report = JSON.parse(row.report_data);
        if (!acc[row.date]) acc[row.date] = [];
        acc[row.date].push(report);
        return acc;
      }, {});
    } else {
      hist = attendanceHistory[context.ownerEmail] || {};
    }

    if (context.isStudent) {
      const filtered = {};
      for (const date of Object.keys(hist)) {
        const reports = hist[date] || [];
        filtered[date] = reports.map(report => {
          const filteredRecords = (report.records || []).filter(r => r.id.toLowerCase() === context.studentRoll.toLowerCase());
          const filteredAbsentees = (report.absentees || []).filter(r => r.toLowerCase() === context.studentRoll.toLowerCase());
          return {
            ...report,
            records: filteredRecords,
            absentees: filteredAbsentees,
            presentCount: filteredRecords.filter(r => r.status === 'Present').length,
            absentCount: filteredRecords.filter(r => r.status === 'Absent').length
          };
        });
      }
      hist = filtered;
    }

    res.json(hist);
  } catch (e) { res.json({}); }
});

app.post('/api/attendance', (req, res) => {
  try {
    const context = getContextInfo(req);
    if (context.isStudent) return res.status(403).json({ error: 'Forbidden' });

    const reportData = req.body;
    const date = reportData.date;

    if (db) {
      db.prepare('INSERT INTO attendance_history (owner_email, date, report_data) VALUES (?, ?, ?)').run(context.ownerEmail, date, JSON.stringify(reportData));
    } else {
      if (!attendanceHistory[context.ownerEmail]) attendanceHistory[context.ownerEmail] = {};
      if (!attendanceHistory[context.ownerEmail][date]) attendanceHistory[context.ownerEmail][date] = [];
      attendanceHistory[context.ownerEmail][date].push(reportData);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/attendance', (req, res) => {
  try {
    const context = getContextInfo(req);
    if (context.isStudent) return res.status(403).json({ error: 'Forbidden' });

    if (db) {
      db.prepare('DELETE FROM attendance_history WHERE owner_email = ?').run(context.ownerEmail);
    } else {
      attendanceHistory[context.ownerEmail] = {};
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Settings ---

app.get('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params;
    const context = getContextInfo(req);

    if (key === 'students' || key === 'studentInfoData') {
      let rows;
      if (db) {
        if (context.isStudent) {
          rows = db.prepare('SELECT * FROM students WHERE owner_email = ? AND LOWER(email) = LOWER(?)').all(context.ownerEmail, context.userEmail);
        } else {
          rows = db.prepare('SELECT * FROM students WHERE owner_email = ?').all(context.ownerEmail);
        }
        rows = getBacklogsGroupedByStudent(rows, context.ownerEmail);
      } else {
        rows = students[context.ownerEmail] || [];
        if (context.isStudent) {
          rows = rows.filter(s => (s.email || '').toLowerCase() === context.userEmail.toLowerCase());
        }
      }

      if (key === 'students') {
        return res.json(rows.map(s => ({ ...s, id: s.roll })));
      }
      return res.json(rows);
    }

    let data = null;
    if (db) {
      const row = db.prepare('SELECT value FROM settings WHERE owner_email = ? AND key = ?').get(context.ownerEmail, key);
      data = row ? JSON.parse(row.value) : null;
    } else {
      data = (settings[context.ownerEmail] || {})[key] ?? null;
    }

    if (context.isStudent && data) {
      if (key === 'attendanceHistory' || key === 'crtAttendanceHistory') {
        const filtered = {};
        for (const date of Object.keys(data)) {
          const reports = data[date] || [];
          filtered[date] = reports.map(report => {
            const filteredRecords = (report.records || []).filter(r => r.id.toLowerCase() === context.studentRoll.toLowerCase());
            const filteredAbsentees = (report.absentees || []).filter(r => r.toLowerCase() === context.studentRoll.toLowerCase());
            return {
              ...report,
              records: filteredRecords,
              absentees: filteredAbsentees,
              presentCount: filteredRecords.filter(r => r.status === 'Present').length,
              absentCount: filteredRecords.filter(r => r.status === 'Absent').length
            };
          });
        }
        data = filtered;
      } else if (key === 'announcements') {
        data = (data || []).filter(ann => 
          ann.target === 'everyone' || 
          ann.target === 'students' || 
          ann.target === 'parents' ||
          (ann.target === 'team' && (ann.targetTeam || '').toLowerCase() === (context.studentTeam || '').toLowerCase())
        );
      }
    }

    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params;
    const context = getContextInfo(req);

    if (context.isStudent) {
      if (key === 'students' || key === 'studentInfoData') {
        const list = req.body;
        if (!Array.isArray(list)) return res.status(400).json({ error: 'Payload must be an array' });
        const invalid = list.some(s => (s.roll || s.id || '').toLowerCase() !== context.studentRoll.toLowerCase());
        if (invalid) return res.status(403).json({ error: 'Forbidden' });

        if (db) {
          const s = list[0];
          let sems = db.prepare('SELECT key FROM semesters WHERE owner_email = ?').all(context.ownerEmail).map(sem => sem.key);
          if (sems.length === 0) sems = ['s11', 's12', 's21', 's22', 's31'];

          db.transaction(() => {
            db.prepare('DELETE FROM student_backlogs WHERE owner_email = ? AND roll = ?').run(context.ownerEmail, context.studentRoll);
            const insertBacklog = db.prepare('INSERT OR REPLACE INTO student_backlogs (owner_email, roll, course_code, semester_key) VALUES (?, ?, ?, ?)');

            const allSubs = [];
            for (const semKey of sems) {
              if (s[semKey] !== undefined) {
                const val = String(s[semKey] || '').trim();
                const subs = val.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
                for (const sub of subs) {
                  db.prepare('INSERT OR IGNORE INTO courses (owner_email, code, name) VALUES (?, ?, ?)').run(context.ownerEmail, sub, sub);
                  insertBacklog.run(context.ownerEmail, context.studentRoll, sub, semKey);
                  allSubs.push(sub);
                }
              }
            }

            const updatedFields = {
              abcId: s.abcId, project: s.project, laptop: s.laptop, club: s.club,
              email: s.email, phone: s.phone, parentName: s.parentName, p1: s.p1, p2: s.p2,
              village: s.village, mandal: s.mandal, district: s.district, state: s.state, pincode: s.pincode,
              backlogs: allSubs.length, backlogSubs: allSubs.join(',')
            };

            const columns = Object.keys(updatedFields).filter(c => s[c] !== undefined);
            const values = columns.map(c => updatedFields[c]);

            if (columns.length > 0) {
              const setClause = columns.map(c => `${c} = ?`).join(', ');
              db.prepare(`UPDATE students SET ${setClause} WHERE owner_email = ? AND roll = ?`).run(...values, context.ownerEmail, context.studentRoll);
            }
          })();
          return res.json({ success: true });
        }

        if (!students[context.ownerEmail]) students[context.ownerEmail] = [];
        const idx = students[context.ownerEmail].findIndex(s => (s.roll || s.id || '').toUpperCase() === context.studentRoll.toUpperCase());
        if (idx !== -1) {
          students[context.ownerEmail][idx] = { ...students[context.ownerEmail][idx], ...list[0] };
        }
        return res.json({ success: true });
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    if (key === 'students' || key === 'studentInfoData') {
      return res.json({ success: true }); // Handled by bulk endpoint or other calls
    }

    if (db) {
      db.prepare('INSERT OR REPLACE INTO settings (owner_email, key, value) VALUES (?, ?, ?)').run(key === 'students' || key === 'studentInfoData' ? null : context.ownerEmail, key, JSON.stringify(req.body));
    } else {
      if (!settings[context.ownerEmail]) settings[context.ownerEmail] = {};
      settings[context.ownerEmail][key] = req.body;
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default app;
