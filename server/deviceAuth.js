import os from 'os';
import crypto from 'crypto';
import db from './db.js';

/**
 * Generate a unique device ID based on hardware and OS information
 */
const generateDeviceId = () => {
  const hostname = os.hostname();
  const platform = os.platform();
  const networkInterfaces = os.networkInterfaces();
  
  // Get MAC addresses from network interfaces
  let macAddresses = '';
  for (const name of Object.keys(networkInterfaces)) {
    const ifaces = networkInterfaces[name];
    for (const iface of ifaces) {
      if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
        macAddresses += iface.mac;
      }
    }
  }
  
  // Create a unique hash based on device characteristics
  const deviceString = `${hostname}:${platform}:${macAddresses}`;
  const deviceId = crypto.createHash('sha256').update(deviceString).digest('hex');
  
  return deviceId;
};

/**
 * Register a device ID in the database
 */
const registerDevice = (deviceId, label = 'Unknown Device') => {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO authorized_devices (device_id, label, registered_at, last_access)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `).run(deviceId, label);
    return true;
  } catch (error) {
    console.error('Error registering device:', error);
    return false;
  }
};

/**
 * Check if a device ID is authorized
 */
const isDeviceAuthorized = (deviceId) => {
  try {
    const result = db.prepare(`
      SELECT device_id FROM authorized_devices WHERE device_id = ?
    `).get(deviceId);
    
    if (result) {
      // Update last access time
      db.prepare(`
        UPDATE authorized_devices SET last_access = datetime('now') WHERE device_id = ?
      `).run(deviceId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking device authorization:', error);
    return false;
  }
};

/**
 * Get the current device ID
 */
const getCurrentDeviceId = () => {
  return generateDeviceId();
};

/**
 * Get all authorized devices
 */
const getAuthorizedDevices = () => {
  try {
    return db.prepare(`
      SELECT device_id, label, registered_at, last_access FROM authorized_devices
    `).all();
  } catch (error) {
    console.error('Error fetching authorized devices:', error);
    return [];
  }
};

/**
 * Remove a device authorization
 */
const revokeDevice = (deviceId) => {
  try {
    db.prepare('DELETE FROM authorized_devices WHERE device_id = ?').run(deviceId);
    return true;
  } catch (error) {
    console.error('Error revoking device:', error);
    return false;
  }
};

export {
  generateDeviceId,
  registerDevice,
  isDeviceAuthorized,
  getCurrentDeviceId,
  getAuthorizedDevices,
  revokeDevice
};
