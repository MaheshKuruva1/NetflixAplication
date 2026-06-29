/**
 * @file src/components/navigation/ProfileMenu.jsx
 * @description Premium user profile dropdown with avatar, plan badge,
 * quick links, theme toggle, and sign out.
 */

import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiUserLine, RiHeartLine, RiSettings3Line,
  RiLogoutBoxLine, RiVipCrownLine, RiQuestionLine,
  RiShieldLine,
} from 'react-icons/ri';
import { useAuth } from '@context/AuthContext.jsx';
import Avatar from '@components/ui/Avatar.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';
import useClickOutside from '@hooks/useClickOutside.js';
import { useState } from 'react';
import { cn } from '@utils/cn.js';
import { ROUTES } from '@constants/routes.js';

/* ── Panel animation ─────────────────────────────────────────────────────────── */
const panelVariants = {
  hidden:  { opacity: 0, scale: 0.94, y: -8 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 32 },
  },
  exit: { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.13 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -6 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.03, duration: 0.22 },
  }),
};

/* ── Menu Item ──────────────────────────────────────────────────────────────── */
function MenuItem({ icon, label, to, onClick, danger, custom, i = 0 }) {
  const base = cn(
    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
    'transition-all duration-100 text-left select-none cursor-pointer',
    danger
      ? 'text-[#ff6b6b] hover:bg-[rgba(229,9,20,0.12)]'
      : 'text-[var(--fg-secondary)] hover:text-white hover:bg-[var(--dropdown-item-hover)]'
  );

  const inner = (
    <motion.div
      custom={i}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      {custom ? (
        <div className={cn(base, 'cursor-default hover:bg-transparent hover:text-[var(--fg-secondary)]')}>
          <span className="flex-shrink-0 text-base" aria-hidden="true">{icon}</span>
          <span className="flex-1">{label}</span>
          {custom}
        </div>
      ) : to ? (
        <Link to={to} className={base}>
          <span className="flex-shrink-0 text-base" aria-hidden="true">{icon}</span>
          {label}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={base}>
          <span className="flex-shrink-0 text-base" aria-hidden="true">{icon}</span>
          {label}
        </button>
      )}
    </motion.div>
  );
  return inner;
}

/* ── Divider ─────────────────────────────────────────────────────────────────── */
function Divider() {
  return <hr className="my-1.5 mx-2" style={{ border: 'none', borderTop: '1px solid var(--border-default)' }} />;
}

/* ── ProfileMenu ────────────────────────────────────────────────────────────── */
export default function ProfileMenu({ isDark, onToggleTheme }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside(() => setIsOpen(false));

  const handleLogout = useCallback(() => {
    logout();
    setIsOpen(false);
    navigate(ROUTES.LOGIN);
  }, [logout, navigate]);

  const close = useCallback(() => setIsOpen(false), []);

  if (!user) {
    return (
      <Link
        to={ROUTES.LOGIN}
        className="hidden sm:flex items-center h-9 px-4 rounded-xl text-sm font-semibold
                   text-white bg-[#e50914] hover:bg-[#ff1a26] transition-colors"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Avatar trigger */}
      <motion.button
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'flex items-center gap-2 rounded-xl p-0.5 transition-all duration-150',
          isOpen && 'ring-2 ring-[#e50914] ring-offset-2 ring-offset-[var(--bg-base)]'
        )}
      >
        <Avatar
          src={user.avatar}
          name={user.name ?? user.email}
          size="sm"
          shape="square"
        />
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="profile-panel"
            role="menu"
            aria-label="Profile menu"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-[calc(100%+10px)] w-[260px] rounded-2xl
                       shadow-[var(--shadow-2xl)] z-[var(--z-dropdown)] overflow-hidden"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            {/* User header */}
            <motion.div
              custom={0}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="px-4 py-4 flex items-center gap-3 border-b"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <Avatar
                src={user.avatar}
                name={user.name ?? user.email}
                size="md"
                shape="square"
                ring
                ringColor="#e50914"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--fg-primary)' }}>
                  {user.name ?? 'Guest'}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                  {user.email}
                </p>
                {/* Plan badge */}
                <span
                  className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full
                             text-[0.62rem] font-black uppercase tracking-wider"
                  style={{
                    background: 'rgba(245,166,35,0.15)',
                    color: '#f5a623',
                    border: '1px solid rgba(245,166,35,0.3)',
                  }}
                >
                  <RiVipCrownLine aria-hidden="true" /> Premium
                </span>
              </div>
            </motion.div>

            {/* Links */}
            <div className="p-2">
              <MenuItem i={1} icon={<RiUserLine />}     label="My Profile"     to={ROUTES.PROFILE}  onClick={close} />
              <MenuItem i={2} icon={<RiHeartLine />}    label="My Watchlist"   to={ROUTES.MY_LIST}  onClick={close} />
              <MenuItem i={3} icon={<RiShieldLine />}   label="Privacy"        to="/"               onClick={close} />
              <MenuItem i={4} icon={<RiSettings3Line />}label="Settings"       to="/"               onClick={close} />
              <MenuItem i={5} icon={<RiQuestionLine />} label="Help Center"    to="/"               onClick={close} />

              {/* Dark mode toggle row */}
              <MenuItem
                i={6}
                icon={isDark ? '🌙' : '☀️'}
                label={isDark ? 'Dark Mode' : 'Light Mode'}
                custom={
                  <DarkModeToggle
                    isDark={isDark}
                    onToggle={(e) => { e.stopPropagation(); onToggleTheme(); }}
                    size="sm"
                  />
                }
              />

              <Divider />

              <MenuItem
                i={7}
                icon={<RiLogoutBoxLine />}
                label="Sign Out"
                danger
                onClick={handleLogout}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
