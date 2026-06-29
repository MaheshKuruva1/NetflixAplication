/**
 * @file src/components/navigation/Navbar.jsx
 * @description Production-ready streaming platform navbar.
 *
 * Features:
 * ✓ Sticky + transparent → glass scroll effect
 * ✓ Hide-on-scroll-down / show-on-scroll-up (smart auto-hide)
 * ✓ Logo with brand animation
 * ✓ Desktop animated NavLinks with active underline (layoutId)
 * ✓ Expanding SearchBar (desktop inline / mobile overlay)
 * ✓ NotificationPanel with badge count
 * ✓ DarkModeToggle (desktop, standalone)
 * ✓ ProfileMenu with user card & plan badge
 * ✓ Mobile hamburger → MobileSidebar
 * ✓ Full React Router integration
 * ✓ Keyboard accessible
 */

import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';

import NavLinks          from './NavLinks.jsx';
import SearchBar         from './SearchBar.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import ProfileMenu       from './ProfileMenu.jsx';
import DarkModeToggle    from './DarkModeToggle.jsx';
import MobileSidebar     from './MobileSidebar.jsx';
import useTheme          from './useTheme.js';
import useScrollPosition from '@hooks/useScrollPosition.js';
import { ROUTES }        from '@constants/routes.js';

/* ── Navbar height (export for layout padding) ───────────────────────────────── */
export const NAVBAR_HEIGHT = 64;

/* ── Navbar ─────────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { scrollY, isScrolled, direction } = useScrollPosition(24);
  const [mobileOpen, setMobileOpen]    = useState(false);

  /* Auto-hide on scroll down, show on scroll up */
  const isHidden = isScrolled && direction === 'down' && !mobileOpen;

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile  = useCallback(() => setMobileOpen(true),  []);

  /* Prevent mobile open on resize to desktop */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeMobile();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobile]);

  /* Compute background */
  const navBg = isScrolled
    ? isDark
      ? 'rgba(10, 10, 15, 0.95)'
      : 'rgba(248, 248, 252, 0.95)'
    : 'transparent';

  const navBorderBottom = isScrolled
    ? isDark
      ? '1px solid rgba(255,255,255,0.06)'
      : '1px solid rgba(0,0,0,0.07)'
    : '1px solid transparent';

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          MAIN NAVBAR
      ════════════════════════════════════════════════════════ */}
      <motion.header
        id="main-navbar"
        role="banner"
        initial={{ y: -NAVBAR_HEIGHT, opacity: 0 }}
        animate={{
          y: isHidden ? -NAVBAR_HEIGHT : 0,
          opacity: 1,
        }}
        transition={{
          y:       { type: 'spring', stiffness: 300, damping: 32 },
          opacity: { duration: 0.3 },
        }}
        className="fixed top-0 left-0 right-0 z-[var(--z-fixed)]"
        style={{
          height: NAVBAR_HEIGHT,
          background: navBg,
          backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: navBorderBottom,
          boxShadow: isScrolled ? '0 4px 24px rgba(0,0,0,0.35)' : 'none',
          transition: 'background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        }}
      >
        <div
          className="h-full flex items-center justify-between gap-4"
          style={{ padding: '0 clamp(1rem, 4vw, 3.5rem)' }}
        >
          {/* ── LEFT: Logo + Nav ── */}
          <div className="flex items-center gap-6 min-w-0">
            {/* Brand logo */}
            <Link
              to={ROUTES.HOME}
              aria-label="BappamMovies — Home"
              className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-[#e50914] rounded-lg"
            >
              <motion.span
                className="font-display font-black text-xl tracking-tighter select-none whitespace-nowrap"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <motion.span
                  style={{ color: '#e50914' }}
                  animate={{ textShadow: isScrolled ? '0 0 20px rgba(229,9,20,0.4)' : '0 0 0px transparent' }}
                  transition={{ duration: 0.4 }}
                >
                  Bappam
                </motion.span>
                <motion.span
                  animate={{ color: isScrolled ? 'var(--fg-secondary)' : 'var(--fg-muted)' }}
                  transition={{ duration: 0.3 }}
                >
                  Movies
                </motion.span>
              </motion.span>
            </Link>

            {/* Desktop nav links */}
            <NavLinks />
          </div>

          {/* ── RIGHT: Action icons ── */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Expanding search (desktop only — mobile uses icon → overlay) */}
            <SearchBar className="hidden sm:flex" />

            {/* Desktop-only: dark mode pill */}
            <div className="hidden lg:flex items-center">
              <DarkModeToggle
                isDark={isDark}
                onToggle={toggleTheme}
                size="sm"
                className="mx-1"
              />
            </div>

            {/* Notifications */}
            <div className="hidden sm:flex">
              <NotificationPanel />
            </div>

            {/* Profile / Sign in */}
            <ProfileMenu isDark={isDark} onToggleTheme={toggleTheme} />

            {/* ── Mobile hamburger ── */}
            <motion.button
              type="button"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-sidebar"
              onClick={mobileOpen ? closeMobile : openMobile}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl
                         text-xl transition-colors ml-1 focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-[#e50914]"
              style={{
                color: mobileOpen ? '#e50914' : 'var(--fg-secondary)',
                background: mobileOpen ? 'rgba(229,9,20,0.12)' : 'rgba(255,255,255,0.04)',
                border: '1px solid',
                borderColor: mobileOpen ? 'rgba(229,9,20,0.3)' : 'var(--border-default)',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <RiCloseLine aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <RiMenuLine aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── Bottom progress bar (scroll indicator) ── */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              key="scroll-bar"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, #e50914, #ff6b35, #e50914)',
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 3s ease infinite',
                originX: 0,
                scaleX: Math.min(1, scrollY / 300),
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </motion.header>

      {/* ════════════════════════════════════════════════════════
          MOBILE SIDEBAR (portal)
      ════════════════════════════════════════════════════════ */}
      <MobileSidebar
        isOpen={mobileOpen}
        onClose={closeMobile}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    </>
  );
}
