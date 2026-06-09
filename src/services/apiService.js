/**
 * API service wrapper that automatically includes admin token in requests
 */

import { getAuthHeaders } from './passwordAuthService';

const API_BASE_URL = 'http://localhost:3001';

/**
 * Make an authenticated API request with admin token
 */
const authenticatedFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API request failed: ${response.status}`);
  }

  return response.json();
};

// Student API endpoints
export const students = {
  getAll: () => authenticatedFetch('/api/students'),
  update: (roll, data) => authenticatedFetch(`/api/students/${roll}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  bulkImport: (students) => authenticatedFetch('/api/students/bulk', {
    method: 'POST',
    body: JSON.stringify(students),
  }),
};

// Attendance API endpoints
export const attendance = {
  getAll: () => authenticatedFetch('/api/attendance'),
  submit: (reportData) => authenticatedFetch('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(reportData),
  }),
  clear: () => authenticatedFetch('/api/attendance', {
    method: 'DELETE',
  }),
};

// Settings API endpoints
export const settings = {
  get: (key) => authenticatedFetch(`/api/settings/${key}`),
  save: (key, value) => authenticatedFetch(`/api/settings/${key}`, {
    method: 'POST',
    body: JSON.stringify(value),
  }),
};

// Admin API endpoints
export const admin = {
  verifyPassword: (password) => fetch(`${API_BASE_URL}/api/admin/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then(r => r.json()),
  initializePassword: (password) => fetch(`${API_BASE_URL}/api/admin/initialize-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then(r => r.json()),
  setPassword: (currentPassword, newPassword) => authenticatedFetch('/api/admin/set-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
  logout: () => authenticatedFetch('/api/admin/logout', {
    method: 'POST',
  }),
};

export default {
  students,
  attendance,
  settings,
  admin,
};
