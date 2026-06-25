import db from './db.js';
import { studentInfoData } from '../src/data/studentInfoData.js';
import { mockClassStudents } from './backlog_data.js';

const insertStudent = db.prepare(`
  INSERT OR REPLACE INTO students (
    owner_email, roll, name, team, cls, room, phone, parentName, p1, p2, email, 
    backlogs, backlogSubs, laptop, club, abcId, project,
    s11, s12, s21, s22, s31
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertSettings = db.prepare(`
  INSERT OR REPLACE INTO settings (owner_email, key, value) VALUES (?, ?, ?)
`);

const seed = () => {
  try {
    const owners = ['k12aidha@example.com', 'bmk@example.com'];

    // 1. Clean out existing tables completely
    db.prepare('DELETE FROM semesters').run();
    db.prepare('DELETE FROM courses').run();
    db.prepare('DELETE FROM student_backlogs').run();
    db.prepare('DELETE FROM students').run();
    db.prepare('DELETE FROM settings').run();

    const insertSem = db.prepare('INSERT OR REPLACE INTO semesters (owner_email, key, label) VALUES (?, ?, ?)');
    const insertCourse = db.prepare('INSERT OR IGNORE INTO courses (owner_email, code, name) VALUES (?, ?, ?)');
    const insertBacklog = db.prepare('INSERT OR REPLACE INTO student_backlogs (owner_email, roll, course_code, semester_key) VALUES (?, ?, ?, ?)');

    const initialSemesters = [
      { key: 's11', label: '1-1' },
      { key: 's12', label: '1-2' },
      { key: 's21', label: '2-1' },
      { key: 's22', label: '2-2' },
      { key: 's31', label: '3-1' }
    ];

    for (const owner of owners) {
      // 1. Seed Semesters
      for (const sem of initialSemesters) {
        insertSem.run(owner, sem.key, sem.label);
      }
      console.log(`Seeded active semesters for ${owner}.`);

      // 2. Seed Students & student_backlogs
      const studentStmt = db.transaction((students) => {
        for (const s of students) {
          const backlogInfo = mockClassStudents.find(m => m.id === s.roll);
          
          insertStudent.run(
            owner,
            s.roll, s.name, s.team, s.cls, s.room, s.phone, s.parentName, 
            s.p1 || null, s.p2 || null, s.email || null, 
            backlogInfo ? backlogInfo.backlogCount : (s.backlogs || 0), 
            s.backlogSubs || null, s.laptop || null, 
            s.club || null, s.abcId || null, s.project || null,
            backlogInfo ? backlogInfo.s11 : null,
            backlogInfo ? backlogInfo.s12 : null,
            backlogInfo ? backlogInfo.s21 : null,
            backlogInfo ? backlogInfo.s22 : null,
            backlogInfo ? backlogInfo.s31 : null
          );

          // Seed individual backlogs from backlogInfo if exists, otherwise from s
          const semKeys = ['s11', 's12', 's21', 's22', 's31'];
          for (const semKey of semKeys) {
            let val = '';
            if (backlogInfo) {
              val = backlogInfo[semKey] || '';
            } else {
              val = s[semKey] || '';
            }
            const subs = val.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
            for (const sub of subs) {
              insertCourse.run(owner, sub, sub);
              insertBacklog.run(owner, s.roll, sub, semKey);
            }
          }
        }
      });
      studentStmt(studentInfoData);
      console.log(`Seeded ${studentInfoData.length} students with dynamic backlog relations for ${owner}.`);

      // 3. Seed Settings
      insertSettings.run(owner, 'classInfo', JSON.stringify({ name: 'K12AIDHA', semester: 'Fall', academicYear: '' }));
      insertSettings.run(owner, 'attendancePolicy', JSON.stringify({ minimumAttendance: 75, warningThreshold: 60, semesterStartMonth: 1, semesterEndMonth: 6 }));
      insertSettings.run(owner, 'semesters', JSON.stringify(initialSemesters));
      console.log(`Seeded settings for ${owner}.`);
    }

    console.log('Database is ready!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seed();
