/**
 * @file src/components/navigation/MobileSidebar.jsx
 * @description Full-screen mobile sidebar drawer.
 * - Slides in from the right
 * - Staggered nav link entry
 * - User card with avatar, plan badge
 * - All nav links with active highlighting
 * - Dark mode toggle inside
 * - Closes on route change
 */

import { useEffect } from 'react';
import { useLocation, Link, NavLink } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCloseLine,
  RiMovieLine, RiTvLine, RiFireLine, RiHeartLine, RiHomeLine,
  RiSearchLine, RiSettings3Line, RiLogoutBoxLine, RiQuestionLine,
  RiVipCrownLine, RiUserLine,
} from 'react-icons/ri';
import { useAuth } from '@context/AuthContext.jsx';
import Avatar from '@components/ui/Avatar.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';
import { cn } from '@utils/cn.js';
import { ROUTES } from '@constants/routes.js';

/* ── Nav groups ─────────────────────────────────────────────────────────────── */
const PRIMARY_LINKS = [
  { label: 'Home',      to: ROUTES.HOME,        icon: <RiHomeLine  />, end: true },
  { label: 'Movies',    to: ROUTES.MOVIES,       icon: <RiMovieLine /> },
  { label: 'TV Shows',  to: ROUTES.TV_SHOWS,     icon: <RiTvLine /> },
  { label: 'New & Hot', to: ROUTES.NEW_POPULAR,  icon: <RiFireLine /> },
  { label: 'My List',   to: ROUTES.MY_LIST,      icon: <RiHeartLine /> },
];

const SECONDARY_LINKS = [
  { label: 'Search',    to: ROUTES.SEARCH,       icon: <RiSearchLine /> },
  { label: 'Profile',   to: ROUTES.PROFILE,      icon: <RiUserLine /> },
  { label: 'Settings',  to: '/',                 icon: <RiSettings3Line /> },
  { label: 'Help',      to: '/',                 icon: <RiQuestionLine /> },
];

/* ── Animation variants ─────────────────────────────────────────────────────── */
const drawerVariants = {
  hidden:  { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 36, mass: 0.9 },
  },
  exit: {
    x: '100%',
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
};

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
};

const linkVariants = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

/* ── MobileSidebar ──────────────────────────────────────────────────────────── */
export default function MobileSidebar({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
}) {
  const { user, logout } = useAuth();
  const location         = useLocation();

  /* Close on route change */
  useEffect(() => { onClose(); }, [location.pathname]);

  /* Body scroll lock */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[calc(var(--z-fixed)-1)]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Drawer ── */}
          <motion.aside
            key="sidebar-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 z-[var(--z-fixed)] flex flex-col
                       w-[min(88vw,340px)]"
            style={{
              background: 'var(--bg-elevated)',
              borderLeft: '1px solid var(--border-default)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 h-16 flex-shrink-0 border-b"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <Link
                to={ROUTES.HOME}
                onClick={onClose}
                className="font-display font-black text-lg tracking-tighter"
              >
                <span style={{ color: '#e50914' }}>Bappam</span>
                <span style={{ color: 'var(--fg-secondary)' }}>Movies</span>
              </Link>

              <motion.button
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-xl
                           transition-colors"
                style={{
                  background: 'var(--btn-ghost-bg)',
                  color: 'var(--fg-muted)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <RiCloseLine aria-hidden="true" />
              </motion.button>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
              {/* User card (if logged in) */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 px-3 py-3 mb-4 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    name={user.name ?? user.email}
                    size="md"
                    shape="square"
                    ring ringColor="#e50914"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--fg-primary)' }}>
                      {user.name ?? 'Guest'}
                    </p>
                    <p className="text-[0.72rem] truncate" style={{ color: 'var(--fg-muted)' }}>
                      {user.email}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full
                                 text-[0.6rem] font-black uppercase tracking-wider"
                      style={{
                        background: 'rgba(245,166,35,0.15)',
                        color: '#f5a623',
                        border: '1px solid rgba(245,166,35,0.25)',
                      }}
                    >
                      <RiVipCrownLine aria-hidden="true" /> Premium
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Primary nav links */}
              <p className="px-3 mb-1.5 text-[0.65rem] font-bold uppercase tracking-widest"
                style={{ color: 'var(--fg-muted)' }}>
                Browse
              </p>
              <motion.nav
                variants={staggerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-0.5 mb-5"
                aria-label="Primary navigation"
              >
                {PRIMARY_LINKS.map((link) => (
                <motion.div key={link.to} variants={linkVariants}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl w-full text-base font-medium',
                        'transition-colors duration-150 focus-visible:outline-none',
                        'focus-visible:ring-2 focus-visible:ring-[#e50914]',
                        isActive ? 'text-white' : 'text-[var(--fg-muted)] hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-lg flex-shrink-0"
                          style={{
                            background: isActive ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.04)',
                            color: isActive ? '#e50914' : 'var(--fg-muted)',
                          }}
                          aria-hidden="true"
                        >
                          {link.icon}
                        </span>
                        <span>{link.label}</span>
                        {isActive && (
                          <span
                            className="ml-auto w-1.5 h-5 rounded-full"
                            style={{ background: '#e50914' }}
                            aria-hidden="true"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
              </motion.nav>

              {/* Secondary links */}
              <p className="px-3 mb-1.5 text-[0.65rem] font-bold uppercase tracking-widest"
                style={{ color: 'var(--fg-muted)' }}>
                Account
              </p>
              <motion.nav
                variants={staggerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-0.5"
                aria-label="Secondary navigation"
              >
                {SECONDARY_LINKS.map((link) => (
                <motion.div key={link.to + link.label} variants={linkVariants}>
                  <NavLink
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium',
                        'transition-colors duration-150 focus-visible:outline-none',
                        'focus-visible:ring-2 focus-visible:ring-[#e50914]',
                        isActive ? 'text-white' : 'text-[var(--fg-muted)] hover:text-white',
                      )
                    }
                  >
                    <span className="text-base flex-shrink-0" aria-hidden="true">{link.icon}</span>
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              </motion.nav>

              {/* Dark mode toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center justify-between px-4 py-3 mt-4 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>
                  {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </span>
                <DarkModeToggle isDark={isDark} onToggle={onToggleTheme} size="md" />
              </motion.div>
            </div>

            {/* ── Footer: Sign out ── */}
            {user && (
              <div
                className="flex-shrink-0 p-4 border-t"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <button
                  type="button"
                  onClick={() => { logout(); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl
                             text-sm font-semibold transition-all duration-150"
                  style={{
                    background: 'rgba(229,9,20,0.1)',
                    color: '#ff6b6b',
                    border: '1px solid rgba(229,9,20,0.25)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(229,9,20,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(229,9,20,0.1)'; }}
                >
                  <RiLogoutBoxLine aria-hidden="true" /> Sign Out
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
