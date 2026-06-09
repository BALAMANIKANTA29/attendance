/**
 * Password authentication service for the frontend
 * Handles admin password verification
 */

const SESSION_TOKEN_KEY = 'app_admin_session';
const SESSION_EXPIRY_KEY = 'app_session_expiry';

// Session expires in 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Get the current session token
 */
export const getSessionToken = () => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  
  if (!token || !expiry) return null;
  
  // Check if session has expired
  if (new Date().getTime() > parseInt(expiry)) {
    clearSession();
    return null;
  }
  
  return token;
};

/**
 * Check if user has an active session
 */
export const hasActiveSession = () => {
  return getSessionToken() !== null;
};

/**
 * Create a new session after successful password verification
 */
export const createSession = (token) => {
  const expiryTime = new Date().getTime() + SESSION_DURATION_MS;
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
};

/**
 * Clear the current session
 */
export const clearSession = () => {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};

/**
 * Verify admin password with the server
 */
export const verifyPassword = async (password, apiBaseUrl = 'http://localhost:3001') => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/verify-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify password');
    }
    
    const result = await response.json();
    
    // Create session with the token
    if (result.token) {
      createSession(result.token);
    }
    
    return { success: true, token: result.token };
  } catch (error) {
    console.error('Password verification error:', error);
    throw error;
  }
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = () => {
  const token = getSessionToken();
  if (!token) {
    return {};
  }
  return {
    'x-admin-token': token,
  };
};

/**
 * Set admin password (requires existing password)
 */
export const setAdminPassword = async (currentPassword, newPassword, apiBaseUrl = 'http://localhost:3001') => {
  try {
    const token = getSessionToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${apiBaseUrl}/api/admin/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to set password');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error setting password:', error);
    throw error;
  }
};

/**
 * Initialize admin password (only works if no password is set yet)
 */
export const initializeAdminPassword = async (password, apiBaseUrl = 'http://localhost:3001') => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/initialize-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize password');
    }
    
    const result = await response.json();
    
    // Create session with the token
    if (result.token) {
      createSession(result.token);
    }
    
    return { success: true, token: result.token };
  } catch (error) {
    console.error('Error initializing password:', error);
    throw error;
  }
};
