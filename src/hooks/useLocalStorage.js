import { useState, useEffect } from 'react';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    
    // If running on Vercel, use relative api route
    if (hostname.includes('vercel.app')) {
      return '/api';
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
export const useLocalStorage = (key, initialValue, userEmail) => {
  // 1. Initial State from LocalStorage (for speed)
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const storageKey = userEmail ? `${userEmail}:${key}` : key;
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return initialValue;
    }
  });

  // 2. Load namespaced data when userEmail changes
  useEffect(() => {
    try {
      const storageKey = userEmail ? `${userEmail}:${key}` : key;
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error(`Error reloading from localStorage for key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, userEmail]);

  // 3. Background Sync from Database on Mount / email change
  useEffect(() => {
    if (!userEmail) return;

    const syncWithDb = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/${key}`, {
          headers: {
            'x-user-email': userEmail
          }
        });
        if (!res.ok) return;
        
        const dbValue = await res.json();
        
        // If DB has data, prefer it over LocalStorage
        if (dbValue !== null && JSON.stringify(dbValue) !== JSON.stringify(storedValue)) {
          setStoredValue(dbValue);
          const storageKey = `${userEmail}:${key}`;
          window.localStorage.setItem(storageKey, JSON.stringify(dbValue));
        }
      } catch (err) {
        console.warn(`Database sync failed for ${key}, falling back to local:`, err);
      }
    };
    
    syncWithDb();
  }, [key, userEmail]);

  // 4. Save to BOTH LocalStorage and Database
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update local state
      setStoredValue(valueToStore);
      
      // Update local storage
      const storageKey = userEmail ? `${userEmail}:${key}` : key;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
      }
      
      // Update database if authenticated (fire and forget)
      if (userEmail) {
        fetch(`${API_URL}/settings/${key}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-email': userEmail
          },
          body: JSON.stringify(valueToStore),
        }).catch(err => console.error(`DB save failed for ${key}:`, err));
      }

    } catch (error) {
      console.error(`Error writing to storage for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
