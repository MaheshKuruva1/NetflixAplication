/**
 * @file src/components/common/Navbar.jsx
 * @description Premium responsive navbar with:
 * - Transparent → solid transition on scroll
 * - Active nav links with animated underline
 * - Search overlay toggle
 * - User avatar dropdown
 * - Mobile hamburger drawer
 * - Framer Motion animations
 */

import { useState, useCallback } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiSearchLine, RiBellLine, RiMenuLine, RiCloseLine,
  RiMovieLine, RiTvLine, RiFireLine, RiHeartLine,
  RiGlobeLine, RiSettings3Line, RiLogoutBoxLine, RiUserLine,
} from 'react-icons/ri';
import { useAuth } from '@context/AuthContext.jsx';
import { useUI } from '@context/UIContext.jsx';
import useScrollPosition from '@hooks/useScrollPosition.js';
import Avatar from '@components/ui/Avatar.jsx';
import Dropdown from '@components/ui/Dropdown.jsx';
import { cn } from '@utils/cn.js';
import { ROUTES } from '@constants/routes.js';

/* ── Nav items ─────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home',       to: ROUTES.HOME,        icon: null },
  { label: 'Movies',     to: ROUTES.MOVIES,      icon: <RiMovieLine /> },
  { label: 'TV Shows',   to: ROUTES.TV_SHOWS,    icon: <RiTvLine /> },
  { label: 'New & Hot',  to: ROUTES.NEW_POPULAR, icon: <RiFireLine /> },
  { label: 'My List',    to: ROUTES.MY_LIST,     icon: <RiHeartLine /> },
];

/* ── Animated underline NavLink ─────────────────────────────────────────────── */
function NavItem({ to, label, icon, mobile = false, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-1.5 font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] rounded-lg',
          mobile
            ? 'text-base px-4 py-3 rounded-xl w-full'
            : 'text-sm px-1 py-0.5',
          isActive
            ? 'text-white'
            : 'text-[var(--fg-muted)] hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          {icon && <span className="text-base" aria-hidden="true">{icon}</span>}
          <span>{label}</span>
          {/* Active underline */}
          {!mobile && isActive && (
            <motion.span
              layoutId="nav-underline"
              className="absolute bottom-[-2px] left-0 right-0 h-[2px] rounded-full bg-[#e50914]"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
          {/* Mobile active dot */}
          {mobile && isActive && (
            <motion.span
              layoutId="mobile-active-dot"
              className="ml-auto w-2 h-2 rounded-full bg-[#e50914]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const { user, logout } = useAuth();
  const { openSearch }   = useUI();
  const navigate         = useNavigate();
  const location         = useLocation();
  const { isScrollTop, scrollY } = useScrollPosition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isScrolled = scrollY > 20;

  const handleLogout = useCallback(() => {
    logout();
    navigate(ROUTES.LOGIN);
  }, [logout, navigate]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* ── Main Navbar ── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-[var(--z-fixed)]',
          'flex items-center justify-between h-16',
          'px-[clamp(1rem,4vw,4rem)]',
          'transition-all duration-400',
        )}
        style={{
          background: isScrolled
            ? 'rgba(10, 10, 15, 0.94)'
            : 'linear-gradient(to bottom, rgba(10,10,15,0.85) 0%, transparent 100%)',
          backdropFilter: isScrolled ? 'blur(18px) saturate(180%)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          boxShadow: isScrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* ── Left: Logo + Nav ── */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] rounded-lg"
            aria-label="BappamMovies Home"
          >
            <motion.span
              className="font-display font-black text-xl tracking-tighter select-none"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <span style={{ color: '#e50914' }}>Bappam</span>
              <span style={{ color: 'var(--fg-secondary)' }}>Movies</span>
            </motion.span>
          </Link>

          {/* Desktop nav links */}
          <nav
            className="hidden lg:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </nav>
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <motion.button
            type="button"
            aria-label="Open search"
            onClick={openSearch}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-lg
                       text-[var(--fg-muted)] hover:text-white transition-colors"
          >
            <RiSearchLine aria-hidden="true" />
          </motion.button>

          {/* Notifications */}
          <motion.button
            type="button"
            aria-label="Notifications"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-lg
                       text-[var(--fg-muted)] hover:text-white transition-colors relative"
          >
            <RiBellLine aria-hidden="true" />
            {/* Notification dot */}
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e50914]"
              aria-hidden="true"
            />
          </motion.button>

          {/* User Dropdown */}
          {user ? (
            <Dropdown
              align="right"
              width={220}
              trigger={({ isOpen }) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer ml-1"
                >
                  <Avatar
                    src={user.avatar}
                    name={user.name ?? user.email}
                    size="sm"
                    ring={isOpen}
                    ringColor="#e50914"
                  />
                </motion.div>
              )}
            >
              {/* User header */}
              <div className="px-3 pt-2 pb-3 border-b border-[var(--border-default)]">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name ?? 'Guest'}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                  {user.email}
                </p>
              </div>

              <div className="pt-1">
                <Dropdown.Item icon={<RiUserLine />} onClick={() => navigate(ROUTES.PROFILE)}>
                  Profile
                </Dropdown.Item>
                <Dropdown.Item icon={<RiHeartLine />} onClick={() => navigate(ROUTES.MY_LIST)}>
                  My List
                </Dropdown.Item>
                <Dropdown.Item icon={<RiSettings3Line />}>
                  Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item icon={<RiLogoutBoxLine />} danger onClick={handleLogout}>
                  Sign out
                </Dropdown.Item>
              </div>
            </Dropdown>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="hidden sm:inline-flex items-center justify-center h-8 px-4 rounded-lg
                         text-sm font-semibold text-white bg-[#e50914] hover:bg-[#ff1a26]
                         transition-colors ml-2"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <motion.button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl
                       text-xl text-[var(--fg-secondary)] hover:text-white transition-colors ml-1"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <RiCloseLine aria-hidden="true" /> : <RiMenuLine aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[calc(var(--z-fixed)-1)] lg:hidden"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={closeMobile}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.nav
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 35 }}
              className="fixed right-0 top-0 bottom-0 z-[var(--z-fixed)] lg:hidden
                         w-[min(85vw,320px)] flex flex-col"
              style={{
                background: 'var(--bg-elevated)',
                borderLeft: '1px solid var(--border-default)',
              }}
              aria-label="Mobile navigation"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--border-default)]">
                <span className="font-display font-black text-lg tracking-tight">
                  <span style={{ color: '#e50914' }}>Bappam</span>
                  <span style={{ color: 'var(--fg-secondary)' }}>Movies</span>
                </span>
                <motion.button
                  type="button"
                  aria-label="Close menu"
                  onClick={closeMobile}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xl
                             text-[var(--fg-muted)] hover:text-white transition-colors"
                >
                  <RiCloseLine aria-hidden="true" />
                </motion.button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <NavItem {...link} mobile onClick={closeMobile} />
                  </motion.div>
                ))}
              </div>

              {/* Mobile user section */}
              {user && (
                <div className="border-t border-[var(--border-default)] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={user.avatar} name={user.name ?? user.email} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.name ?? 'Guest'}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleLogout(); closeMobile(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
                               text-[#ff6b6b] bg-[rgba(229,9,20,0.1)] hover:bg-[rgba(229,9,20,0.2)]
                               transition-colors"
                  >
                    <RiLogoutBoxLine aria-hidden="true" /> Sign out
                  </button>
                </div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
