import { useState, useEffect, useRef } from 'react';
import { 
  isSupabaseConfigured, 
  upsertSupabaseSettings, 
  fetchSupabaseSettings,
  upsertSupabaseStudents,
  fetchSupabaseStudents
} from '../lib/supabase';

// Default owner email when no user is logged in yet
const DEFAULT_OWNER = 'k12aidha@example.com';

/**
 * useLocalStorage — now purely Supabase-backed.
 * localStorage has been removed. Supabase is the single source of truth.
 *
 * Behaviour:
 *  - React state  → instant UI updates (in-memory)
 *  - Supabase     → persistent cloud storage (read on mount, write on every change)
 *  - No localStorage, no SQLite
 */
export const useLocalStorage = (key, initialValue, userEmail) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimerRef = useRef(null);

  const ownerEmail = userEmail || DEFAULT_OWNER;

  // ── Load from Supabase on mount / userEmail change ──────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    const loadData = async () => {
      try {
        let cloudValue;
        
        if (key === 'studentInfoData') {
          cloudValue = await fetchSupabaseStudents(ownerEmail);
        } else {
          cloudValue = await fetchSupabaseSettings(ownerEmail, key);
        }

        if (cloudValue !== null && cloudValue !== undefined) {
          const isEmpty = Array.isArray(cloudValue) && cloudValue.length === 0;
          if (!isEmpty) {
            setStoredValue(cloudValue);
            
            // Per user request, remove from local storage once data is securely in Supabase
            try {
              window.localStorage.removeItem(`${ownerEmail}_${key}`);
            } catch(e) {}
          }
        }
      } catch (err) {
        console.warn(`[Supabase] Load failed for "${key}":`, err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [key, ownerEmail]);

  // ── Save to Supabase on every value change ──────────────────────────────
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Update React state immediately so the UI feels instant
      setStoredValue(valueToStore);

      if (!isSupabaseConfigured) return;

      // Debounce rapid successive saves (e.g. typing) to avoid flooding Supabase
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        if (key === 'studentInfoData') {
          // Bulk upserts for student data are disabled to prevent overwriting
          // targeted updates. Targeted updates are handled directly by components.
        } else {
          upsertSupabaseSettings(ownerEmail, key, valueToStore)
            .then(ok => {
              if (!ok) console.warn(`[Supabase] Save failed for "${key}"`);
            })
            .catch(err => console.warn(`[Supabase] Save error for "${key}":`, err));
        }
      }, 300); // 300ms debounce

    } catch (error) {
      console.error(`Error saving "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
