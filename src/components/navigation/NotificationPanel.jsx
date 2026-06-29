/**
 * @file src/components/navigation/NotificationPanel.jsx
 * @description Bell icon with animated badge count + animated slide-down panel.
 * Notifications are local state (replace with real API data when ready).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiBellLine, RiBellFill, RiCheckDoubleLine,
  RiFilmLine, RiStarLine, RiFireLine, RiTimeLine,
} from 'react-icons/ri';
import useClickOutside from '@hooks/useClickOutside.js';
import { cn } from '@utils/cn.js';

/* ── Mock notifications ─────────────────────────────────────────────────────── */
const MOCK_NOTIFICATIONS = [
  {
    id: 1, read: false, type: 'new',
    icon: <RiFireLine />, color: '#e50914',
    title: 'New this week',
    message: 'Dune: Part Two is now available to stream.',
    time: '2m ago',
    href: '/movie/693134',
  },
  {
    id: 2, read: false, type: 'recommendation',
    icon: <RiStarLine />, color: '#f5a623',
    title: 'Recommended for you',
    message: 'Based on your watch history: The Last of Us',
    time: '1h ago',
    href: '/tv/100088',
  },
  {
    id: 3, read: false, type: 'new',
    icon: <RiFilmLine />, color: '#00d4ff',
    title: 'Continue watching',
    message: 'You left off at Episode 4 of Breaking Bad.',
    time: '3h ago',
    href: '/tv/1396',
  },
  {
    id: 4, read: true, type: 'info',
    icon: <RiTimeLine />, color: 'var(--fg-muted)',
    title: 'Leaving soon',
    message: 'Interstellar will be removed in 7 days.',
    time: '1d ago',
    href: '/movie/157336',
  },
];

/* ── Panel animation ─────────────────────────────────────────────────────────── */
const panelVariants = {
  hidden:  { opacity: 0, scale: 0.94, y: -8 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 32 },
  },
  exit: { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function NotificationPanel() {
  const [isOpen, setIsOpen]   = useState(false);
  const [notifs, setNotifs]   = useState(MOCK_NOTIFICATIONS);
  const containerRef = useClickOutside(() => setIsOpen(false));
  const unreadCount  = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <motion.button
        type="button"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-xl text-lg transition-colors duration-150',
          isOpen ? 'text-white' : 'text-[var(--fg-muted)] hover:text-white'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="filled"
              initial={{ scale: 0.6, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <RiBellFill aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span key="outline">
              <RiBellLine aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 30 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center
                         w-4 h-4 rounded-full text-[0.6rem] font-black text-white"
              style={{ background: '#e50914', lineHeight: 1 }}
              aria-hidden="true"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="notif-panel"
            role="dialog"
            aria-label="Notifications"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-[calc(100%+10px)] w-[340px] rounded-2xl overflow-hidden
                       shadow-[var(--shadow-2xl)] z-[var(--z-dropdown)]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold" style={{ color: 'var(--fg-primary)' }}>
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[0.6rem] font-black"
                    style={{ background: 'rgba(229,9,20,0.2)', color: '#ff6b6b' }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[0.72rem] font-medium
                             hover:text-white transition-colors"
                  style={{ color: 'var(--fg-muted)' }}
                >
                  <RiCheckDoubleLine className="text-sm" aria-hidden="true" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <ul className="max-h-[380px] overflow-y-auto py-1.5" role="list">
              {notifs.map((n, i) => (
                <motion.li
                  key={n.id}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to={n.href}
                    onClick={() => { markRead(n.id); setIsOpen(false); }}
                    className="flex items-start gap-3 px-4 py-3 transition-colors duration-100
                               hover:bg-[var(--dropdown-item-hover)]"
                  >
                    {/* Icon */}
                    <span
                      className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl text-base mt-0.5"
                      style={{
                        background: `${n.color}18`,
                        color: n.color,
                        border: `1px solid ${n.color}30`,
                      }}
                      aria-hidden="true"
                    >
                      {n.icon}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-xs font-semibold leading-snug"
                          style={{ color: n.read ? 'var(--fg-secondary)' : 'var(--fg-primary)' }}
                        >
                          {n.title}
                        </p>
                        <span className="flex-shrink-0 text-[0.65rem]"
                          style={{ color: 'var(--fg-muted)' }}>
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[0.72rem] mt-0.5 leading-snug line-clamp-2"
                        style={{ color: 'var(--fg-muted)' }}>
                        {n.message}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                        style={{ background: '#e50914' }}
                        aria-label="Unread"
                      />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Footer */}
            <div
              className="px-4 py-2.5 border-t text-center"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium hover:text-white transition-colors"
                style={{ color: '#e50914' }}
              >
                View all notifications →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
