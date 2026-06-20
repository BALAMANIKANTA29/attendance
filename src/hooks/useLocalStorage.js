import { useState, useEffect } from 'react';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    
    // If running on Vercel, use local fallback
    if (hostname.includes('vercel.app')) {
      return 'http://localhost:3001/api';
    }
    
    // If accessed on localhost, relative '/api' goes through Vite proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
    
    // If accessed from other devices via IP (e.g. 192.168.x.x), connect directly to the Express backend port 3001
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:3001/api`;
    }
    
    return '/api';
  }
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

/**
 * useLocalStorage Bridge Hook
 * This hook maintains the SAME interface as the original version but 
 * secretly synchronizes all data with the SQLite database.
 */
export const useLocalStorage = (key, initialValue) => {
  // 1. Initial State from LocalStorage (for speed)
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return initialValue;
    }
  });

  // 2. Background Sync from Database on Mount
  useEffect(() => {
    const syncWithDb = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/${key}`);
        if (!res.ok) return;
        
        const dbValue = await res.json();
        
        // If DB has data, prefer it over LocalStorage
        if (dbValue !== null && JSON.stringify(dbValue) !== JSON.stringify(storedValue)) {
          setStoredValue(dbValue);
          window.localStorage.setItem(key, JSON.stringify(dbValue));
        }
      } catch (err) {
        console.warn(`Database sync failed for ${key}, falling back to local:`, err);
      }
    };
    
    syncWithDb();
  }, [key]);

  // 3. Save to BOTH LocalStorage and Database
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update local state
      setStoredValue(valueToStore);
      
      // Update local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      
      // Update database (fire and forget)
      fetch(`${API_URL}/settings/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valueToStore),
      }).catch(err => console.error(`DB save failed for ${key}:`, err));

    } catch (error) {
      console.error(`Error writing to storage for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
