/**
 * @file src/hooks/useLocalStorage.js
 * @description Sync state to localStorage with JSON serialization.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * @param {string} key           - localStorage key
 * @param {any}    initialValue  - Default value if key not found
 * @returns {[any, Function, Function]} [value, setValue, removeValue]
 */
function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
      // Notify other tabs/windows
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(valueToStore) }));
    } catch (err) {
      console.warn(`[useLocalStorage] Failed to set key "${key}":`, err);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
