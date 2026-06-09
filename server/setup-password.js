import crypto from 'crypto';
import db from './db.js';

/**
 * Initialize admin password during setup
 * Run this once to set the default admin password
 */
const initializeDefaultPassword = () => {
  try {
    // Check if password already exists
    const existing = db.prepare('SELECT * FROM admin_settings WHERE key = ?').get('admin_password');
    
    if (existing) {
      console.log('✅ Admin password already set');
      console.log('Password Hash:', existing.value);
      return;
    }
    
    // Set default password: 2027
    const defaultPassword = '2027';
    const hashedPassword = crypto.createHash('sha256').update(defaultPassword).digest('hex');
    
    db.prepare('INSERT INTO admin_settings (key, value) VALUES (?, ?)').run('admin_password', hashedPassword);
    
    console.log('✅ Admin password initialized successfully');
    console.log('Password: 2027');
    console.log('Password Hash:', hashedPassword);
    console.log('\nYou can now login with admin password: 2027');
    
  } catch (error) {
    console.error('❌ Error initializing password:', error.message);
  }
};

initializeDefaultPassword();
