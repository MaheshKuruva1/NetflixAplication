/**
 * @file src/hooks/useClickOutside.js
 * @description Fire a callback when a click occurs outside the referenced element.
 *
 * @example
 * const ref = useClickOutside(() => setOpen(false));
 * <div ref={ref}>Dropdown content</div>
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * @param {() => void} callback  - Called on outside click
 * @param {string[]}   [events]  - Events to listen to (default: mousedown + touchstart)
 * @returns {React.RefObject}
 */
function useClickOutside(callback, events = ['mousedown', 'touchstart']) {
  const ref = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const handleEvent = useCallback((e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      callbackRef.current(e);
    }
  }, []);

  useEffect(() => {
    events.forEach((event) =>
      document.addEventListener(event, handleEvent, { passive: true })
    );
    return () =>
      events.forEach((event) =>
        document.removeEventListener(event, handleEvent)
      );
  }, [events, handleEvent]);

  return ref;
}

export default useClickOutside;
