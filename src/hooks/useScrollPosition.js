/**
 * @file src/hooks/useScrollPosition.js
 * @description Tracks window scroll Y with throttling for navbar transparency effects.
 *
 * @example
 * const { scrollY, isScrolled, direction } = useScrollPosition(80);
 */

import { useState, useEffect, useRef } from 'react';

/**
 * @param {number} [threshold=80] - scrollY above which isScrolled becomes true
 * @returns {{ scrollY: number, isScrolled: boolean, direction: 'up'|'down'|null }}
 */
function useScrollPosition(threshold = 80) {
  const [scrollY,    setScrollY]    = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [direction,  setDirection]  = useState(null);
  const lastScrollY = useRef(0);
  const rafId       = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        const current = window.scrollY;
        setScrollY(current);
        setIsScrolled(current > threshold);
        setDirection(current > lastScrollY.current ? 'down' : 'up');
        lastScrollY.current = current;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [threshold]);

  return { scrollY, isScrolled, direction };
}

export default useScrollPosition;
