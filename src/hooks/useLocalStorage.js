import { useState, useEffect } from 'react';

/**
 * Custom React hook for synchronizing state with localStorage
 * @param {string} key The localStorage key
 * @param {any} initialValue The fallback initial value
 * @returns {[any, Function]} The current state and state setter
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (e) {
      console.error(`Error loading localStorage key "${key}":`, e);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting localStorage key "${key}":`, e);
    }
  }, [key, value]);

  return [value, setValue];
}
