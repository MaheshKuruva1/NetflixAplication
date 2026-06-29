/**
 * @file src/hooks/useDebounce.js
 * @description Returns a debounced version of a value. Useful for search inputs.
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 400);
 */

import { useState, useEffect } from 'react';

/**
 * @param {any}    value  - The value to debounce
 * @param {number} delay  - Delay in milliseconds (default 400ms)
 * @returns {any}          Debounced value
 */
function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
