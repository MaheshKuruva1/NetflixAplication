/**
 * @file src/components/common/Toast.jsx
 * @description Global toast notification system.
 * Usage: import { useToast } from '@components/common/Toast.jsx'
 *        const { success, error, info, warning } = useToast();
 *        success('Added to watchlist!');
 */

import { createContext, useContext, useState, useCallback, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCheckLine, RiErrorWarningLine,
  RiInformationLine, RiAlertLine, RiCloseLine,
} from 'react-icons/ri';
import { cn } from '@utils/cn.js';

/* ── Toast Context ──────────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

/* ── Variant Config ─────────────────────────────────────────────────────────── */
const VARIANTS = {
  success: {
    icon:    <RiCheckLine aria-hidden="true" />,
    bg:      'rgba(0,200,100,0.12)',
    border:  'rgba(0,200,100,0.3)',
    iconBg:  'rgba(0,200,100,0.2)',
    color:   '#00c864',
  },
  error: {
    icon:    <RiErrorWarningLine aria-hidden="true" />,
    bg:      'rgba(229,9,20,0.12)',
    border:  'rgba(229,9,20,0.35)',
    iconBg:  'rgba(229,9,20,0.2)',
    color:   '#ff6b6b',
  },
  warning: {
    icon:    <RiAlertLine aria-hidden="true" />,
    bg:      'rgba(245,166,35,0.12)',
    border:  'rgba(245,166,35,0.3)',
    iconBg:  'rgba(245,166,35,0.2)',
    color:   '#f5a623',
  },
  info: {
    icon:    <RiInformationLine aria-hidden="true" />,
    bg:      'rgba(0,212,255,0.1)',
    border:  'rgba(0,212,255,0.25)',
    iconBg:  'rgba(0,212,255,0.15)',
    color:   '#00d4ff',
  },
};

/* ── Single Toast Item ──────────────────────────────────────────────────────── */
function ToastItem({ id, type, title, message, duration, onDismiss }) {
  const v = VARIANTS[type] ?? VARIANTS.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 w-full max-w-sm rounded-2xl p-4 shadow-[var(--shadow-xl)]"
      style={{
        background: `linear-gradient(135deg, ${v.bg}, rgba(10,10,15,0.85))`,
        border: `1px solid ${v.border}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Icon */}
      <span
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl text-lg font-bold"
        style={{ background: v.iconBg, color: v.color }}
        aria-hidden="true"
      >
        {v.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        {title && (
          <p className="text-sm font-semibold leading-snug" style={{ color: '#ffffff' }}>
            {title}
          </p>
        )}
        {message && (
          <p className={cn('text-xs leading-snug', title ? 'mt-0.5' : '')}
            style={{ color: 'var(--fg-secondary)' }}>
            {message}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-base
                   opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--fg-secondary)' }}
        aria-label="Dismiss notification"
      >
        <RiCloseLine aria-hidden="true" />
      </button>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] rounded-b-2xl"
        style={{ background: v.color, width: '100%', originX: 0 }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

/* ── Provider ───────────────────────────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type, titleOrMessage, message, opts = {}) => {
    const { duration = 4000 } = opts;
    const id = `toast-${++counterRef.current}`;
    const isString = typeof message === 'string';
    const toast = {
      id,
      type,
      title:   isString ? titleOrMessage : undefined,
      message: isString ? message : titleOrMessage,
      duration,
    };

    setToasts((prev) => [...prev.slice(-4), toast]); // max 5 toasts

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const api = {
    show,
    success: (...args) => show('success', ...args),
    error:   (...args) => show('error', ...args),
    warning: (...args) => show('warning', ...args),
    info:    (...args) => show('info', ...args),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="fixed right-4 bottom-4 z-[var(--z-toast)] flex flex-col-reverse gap-2 items-end"
          style={{ pointerEvents: 'none' }}
        >
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <div key={toast.id} style={{ pointerEvents: 'auto', position: 'relative' }}>
                <ToastItem {...toast} onDismiss={dismiss} />
              </div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export default ToastProvider;
