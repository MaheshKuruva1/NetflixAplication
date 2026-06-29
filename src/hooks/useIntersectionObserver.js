/**
 * @file src/hooks/useIntersectionObserver.js
 * @description Observe when an element enters the viewport for lazy loading / infinite scroll.
 *
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
 * <div ref={ref}>{isIntersecting && <HeavyComponent />}</div>
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @param {IntersectionObserverInit} [options]
 * @returns {{ ref: React.RefCallback, isIntersecting: boolean, entry: IntersectionObserverEntry|null }}
 */
function useIntersectionObserver(options = {}) {
  const {
    threshold  = 0,
    root       = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState(null);
  const observer = useRef(null);

  const isIntersecting = !!entry?.isIntersecting;
  const frozen = freezeOnceVisible && isIntersecting;

  const ref = useCallback(
    (node) => {
      if (frozen) return;
      if (observer.current) observer.current.disconnect();
      if (!node) return;

      observer.current = new IntersectionObserver(
        ([e]) => setEntry(e),
        { threshold, root, rootMargin }
      );
      observer.current.observe(node);
    },
    [threshold, root, rootMargin, frozen]
  );

  useEffect(() => () => observer.current?.disconnect(), []);

  return { ref, isIntersecting, entry };
}

export default useIntersectionObserver;
