/**
 * @file src/components/media/TrailerModal.jsx
 * @description YouTube trailer embed inside a full-screen modal.
 * Stops playback on close. Keyboard accessible (Escape closes).
 */

import { useEffect, useRef } from 'react';
import { createPortal }      from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiYoutubeFill } from 'react-icons/ri';

export default function TrailerModal({ videoKey, title = 'Trailer', isOpen, onClose }) {
  const iframeRef = useRef(null);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  /* Body scroll lock */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!videoKey) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="trailer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            key="trailer-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="relative w-full max-w-5xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <RiYoutubeFill className="text-2xl" style={{ color: '#ff0000' }} aria-hidden="true" />
                <h2 className="text-sm font-bold" style={{ color: 'var(--fg-secondary)' }}>
                  {title}
                </h2>
              </div>
              <motion.button
                type="button"
                aria-label="Close trailer"
                onClick={onClose}
                whileHover={{ scale: 1.12, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex items-center justify-center w-9 h-9 rounded-full text-xl"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                }}
              >
                <RiCloseLine aria-hidden="true" />
              </motion.button>
            </div>

            {/* YouTube iframe */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                paddingBottom: '56.25%',     /* 16:9 */
                height: 0,
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1&color=white`}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
