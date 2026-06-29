/**
 * @file src/hooks/useMediaQuery.js
 * @description Subscribe to a CSS media query and reactively get a boolean result.
 *
 * @example
 * const isMobile  = useMediaQuery('(max-width: 768px)');
 * const isDark    = useMediaQuery('(prefers-color-scheme: dark)');
 */

import { useState, useEffect } from 'react';

/** Commonly used breakpoints */
export const BREAKPOINTS = {
  xs:  '(max-width: 479px)',
  sm:  '(max-width: 639px)',
  md:  '(max-width: 767px)',
  lg:  '(max-width: 1023px)',
  xl:  '(max-width: 1279px)',
  '2xl': '(max-width: 1535px)',
};

/**
 * @param {string} query - CSS media query string
 * @returns {boolean}
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);

    mql.addEventListener('change', onChange);
    setMatches(mql.matches); // sync immediately

    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export default useMediaQuery;
