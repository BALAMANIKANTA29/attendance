/**
 * Device authentication service for the frontend
 * Handles device registration and ID management
 */

const DEVICE_ID_KEY = 'app_device_id';
const DEVICE_REGISTERED_KEY = 'app_device_registered';

/**
 * Get the stored device ID or create a new one
 */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate a new device ID (combined with timestamp for uniqueness)
    deviceId = generateClientDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

/**
 * Generate a unique device ID on the client side
 * This is a fallback client-side ID combined with server-verified info
 */
const generateClientDeviceId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const userAgent = navigator.userAgent.substring(0, 20);
  const screen = `${window.screen.width}x${window.screen.height}`;
  
  return btoa(`${timestamp}:${random}:${userAgent}:${screen}`).replace(/[=+/]/g, '');
};

/**
 * Check if device is registered
 */
export const isDeviceRegistered = () => {
  return localStorage.getItem(DEVICE_REGISTERED_KEY) === 'true';
};

/**
 * Mark device as registered
 */
export const markDeviceAsRegistered = () => {
  localStorage.setItem(DEVICE_REGISTERED_KEY, 'true');
};

/**
 * Mark device as unregistered
 */
export const clearDeviceRegistration = () => {
  localStorage.removeItem(DEVICE_REGISTERED_KEY);
};

/**
 * Register the device with the server
 */
export const registerDevice = async (apiBaseUrl = 'http://localhost:3001') => {
  try {
    const deviceId = getDeviceId();
    const hostname = 'My Device'; // Default label
    
    const response = await fetch(`${apiBaseUrl}/api/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        label: hostname,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register device');
    }
    
    const result = await response.json();
    markDeviceAsRegistered();
    return { success: true, deviceId, message: result.message };
  } catch (error) {
    console.error('Device registration error:', error);
    throw error;
  }
};

/**
 * Get device info from the server
 */
export const getDeviceInfo = async (apiBaseUrl = 'http://localhost:3001') => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/device/info`);
    
    if (!response.ok) {
      throw new Error('Failed to get device info');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting device info:', error);
    throw error;
  }
};

/**
 * Add device ID to API headers
 */
export const getAuthHeaders = () => {
  const deviceId = getDeviceId();
  return {
    'x-device-id': deviceId,
  };
};
