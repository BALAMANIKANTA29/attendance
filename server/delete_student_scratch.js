import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'attendance.db');
console.log('Opening database at:', dbPath);
const db = new Database(dbPath);

try {
  const roll = '236Q1A4503';
  const deleteBacklogs = db.prepare('DELETE FROM student_backlogs WHERE roll = ?');
  const deleteStudent = db.prepare('DELETE FROM students WHERE roll = ?');
  
  db.transaction(() => {
    const resBacklogs = deleteBacklogs.run(roll);
    console.log('Deleted backlogs:', resBacklogs.changes);
    const resStudent = deleteStudent.run(roll);
    console.log('Deleted student:', resStudent.changes);
  })();
  
  console.log('Successfully deleted ABHI CHANDANA from database.');
} catch (err) {
  console.error('Error executing delete query:', err);
} finally {
  db.close();
}
