/**
 * @file src/components/common/Modal.jsx
 * @description Full-featured modal with:
 * - Focus trap + keyboard close (Escape)
 * - Body scroll lock
 * - AnimatePresence fade + scale
 * - 4 size variants
 * - Compound Header / Body / Footer
 * - Portal to document.body
 */

import { useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';
import { cn } from '@utils/cn.js';

/* ── Sizes ─────────────────────────────────────────────────────────────────── */
const SIZES = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

/* ── Focus trap hook ─────────────────────────────────────────────────────────── */
function useFocusTrap(active) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const el    = ref.current;
    const focus = el.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focus[0];
    const last  = focus[focus.length - 1];
    const handle = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
    };
    el.addEventListener('keydown', handle);
    first?.focus();
    return () => el.removeEventListener('keydown', handle);
  }, [active]);
  return ref;
}

/* ── Modal ──────────────────────────────────────────────────────────────────── */
export default function Modal({
  isOpen,
  onClose,
  size       = 'md',
  title,
  children,
  showClose  = true,
  closeOnBackdrop = true,
  className,
}) {
  const id          = useId();
  const titleId     = `modal-title-${id}`;
  const panelRef    = useFocusTrap(isOpen);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  /* Body scroll lock */
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  const handleBackdrop = useCallback(
    (e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose?.(); },
    [closeOnBackdrop, onClose]
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        /* ── Backdrop ── */
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)' }}
          onClick={handleBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
        >
          {/* ── Panel ── */}
          <motion.div
            ref={panelRef}
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className={cn(
              'relative w-full rounded-2xl overflow-hidden',
              'border shadow-[var(--shadow-2xl)]',
              SIZES[size] ?? SIZES.md,
              className,
            )}
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
            }}
          >
            {/* Close button */}
            {showClose && (
              <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 flex items-center justify-center
                           w-8 h-8 rounded-xl text-xl transition-all duration-150"
                style={{
                  color: 'var(--fg-muted)',
                  background: 'var(--btn-ghost-bg)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'var(--btn-ghost-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--fg-muted)';
                  e.currentTarget.style.background = 'var(--btn-ghost-bg)';
                }}
              >
                <RiCloseLine aria-hidden="true" />
              </button>
            )}

            {/* Default title */}
            {title && (
              <div
                className="px-6 pt-6 pb-4 border-b"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <h2
                  id={titleId}
                  className="text-lg font-bold pr-8"
                  style={{ color: 'var(--fg-primary)' }}
                >
                  {title}
                </h2>
              </div>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ── Compound subcomponents ─────────────────────────────────────────────────── */
Modal.Header = function ModalHeader({ title, subtitle, className }) {
  return (
    <div
      className={cn('px-6 pt-6 pb-4 border-b', className)}
      style={{ borderColor: 'var(--border-default)' }}
    >
      {title && (
        <h2 className="text-lg font-bold pr-10" style={{ color: 'var(--fg-primary)' }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

Modal.Body = function ModalBody({ className, children }) {
  return (
    <div className={cn('px-6 py-5 overflow-y-auto max-h-[70vh]', className)}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({ className, children }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t flex items-center justify-end gap-3',
        className
      )}
      style={{ borderColor: 'var(--border-default)' }}
    >
      {children}
    </div>
  );
};

/* ── Confirm Dialog ─────────────────────────────────────────────────────────── */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title     = 'Are you sure?',
  message,
  confirmLabel  = 'Confirm',
  cancelLabel   = 'Cancel',
  danger        = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <Modal.Header title={title} subtitle={message} />
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="h-9 px-4 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: 'var(--btn-ghost-bg)',
            color: 'var(--fg-secondary)',
            border: '1px solid var(--border-default)',
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => { onConfirm?.(); onClose?.(); }}
          className="h-9 px-5 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: danger ? '#e50914' : 'rgba(229,9,20,0.15)',
            color: danger ? '#fff' : '#ff6b6b',
            border: danger ? 'none' : '1px solid rgba(229,9,20,0.3)',
          }}
        >
          {confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
