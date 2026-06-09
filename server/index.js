import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import db from './db.js';
import os from 'os';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Utility functions for password hashing
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware to verify admin token for protected endpoints
const verifyAdminToken = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please verify with admin password.' });
  }
  
  try {
    const session = db.prepare('SELECT * FROM admin_sessions WHERE token = ?').get(token);
    
    if (!session) {
      return res.status(403).json({ error: 'Invalid or expired token. Please verify password again.' });
    }
    
    // Check if token has expired
    const expiryTime = new Date(session.expires_at).getTime();
    if (new Date().getTime() > expiryTime) {
      // Delete expired token
      db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
      return res.status(403).json({ error: 'Session expired. Please verify password again.' });
    }
    
    // Update last access time
    db.prepare('UPDATE admin_sessions SET last_access = datetime("now") WHERE token = ?').run(token);
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Admin Password & Authentication Endpoints ---

app.post('/api/admin/initialize-password', (req, res) => {
  const { password } = req.body;
  
  if (!password || password.trim().length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }
  
  try {
    // Check if password already exists
    const existing = db.prepare('SELECT * FROM admin_settings WHERE key = ?').get('admin_password');
    
    if (existing) {
      return res.status(400).json({ error: 'Admin password already initialized. Use verify-password to login.' });
    }
    
    // Hash and store password
    const hashedPassword = hashPassword(password);
    db.prepare('INSERT INTO admin_settings (key, value) VALUES (?, ?)').run('admin_password', hashedPassword);
    
    // Create session token
    const token = generateToken();
    const expiryTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)').run(token, expiryTime);
    
    res.json({ success: true, message: 'Admin password initialized', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/verify-password', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  try {
    // Get stored password
    const result = db.prepare('SELECT value FROM admin_settings WHERE key = ?').get('admin_password');
    
    if (!result) {
      return res.status(400).json({ error: 'Admin password not configured. Please initialize it first.' });
    }
    
    const storedHash = result.value;
    const inputHash = hashPassword(password);
    
    if (storedHash !== inputHash) {
      return res.status(401).json({ error: 'Incorrect admin password' });
    }
    
    // Create session token
    const token = generateToken();
    const expiryTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)').run(token, expiryTime);
    
    res.json({ success: true, message: 'Password verified', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/set-password', verifyAdminToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }
  
  try {
    // Verify current password
    const result = db.prepare('SELECT value FROM admin_settings WHERE key = ?').get('admin_password');
    
    if (!result) {
      return res.status(400).json({ error: 'Admin password not set' });
    }
    
    const storedHash = result.value;
    const currentHash = hashPassword(currentPassword);
    
    if (storedHash !== currentHash) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    const newHash = hashPassword(newPassword);
    db.prepare('UPDATE admin_settings SET value = ? WHERE key = ?').run(newHash, 'admin_password');
    
    // Invalidate all existing sessions
    db.prepare('DELETE FROM admin_sessions').run();
    
    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/logout', verifyAdminToken, (req, res) => {
  const token = req.headers['x-admin-token'];
  
  try {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Students ---

app.get('/api/students', verifyAdminToken, (req, res) => {
  const students = db.prepare('SELECT * FROM students').all();
  res.json(students);
});

app.put('/api/students/:roll', verifyAdminToken, (req, res) => {
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

app.post('/api/students/bulk', verifyAdminToken, (req, res) => {
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

app.get('/api/attendance', verifyAdminToken, (req, res) => {
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

app.post('/api/attendance', verifyAdminToken, (req, res) => {
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

app.delete('/api/attendance', verifyAdminToken, (req, res) => {
    try {
        db.prepare('DELETE FROM attendance_history').run();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Settings ---

app.get('/api/settings/:key', verifyAdminToken, (req, res) => {
  const { key } = req.params;
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  res.json(row ? JSON.parse(row.value) : null);
});

app.post('/api/settings/:key', verifyAdminToken, (req, res) => {
  const { key } = req.params;
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
