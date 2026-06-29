/**
 * @file src/components/navigation/NavLinks.jsx
 * @description Horizontal desktop nav links with:
 * - Animated active underline (shared layoutId)
 * - Hover preview label
 * - Framer Motion staggered entry
 */

import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn.js';
import { ROUTES } from '@constants/routes.js';

export const NAV_ITEMS = [
  { label: 'Home',       to: ROUTES.HOME,        end: true },
  { label: 'Movies',     to: ROUTES.MOVIES },
  { label: 'TV Shows',   to: ROUTES.TV_SHOWS },
  { label: 'New & Hot',  to: ROUTES.NEW_POPULAR },
  { label: 'My List',    to: ROUTES.MY_LIST },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function NavLinks({ className }) {
  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('hidden lg:flex items-center gap-1', className)}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => (
        <motion.div key={item.to} variants={itemVariants}>
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'relative flex items-center px-3 py-1.5 rounded-lg text-sm font-medium',
                'transition-colors duration-150 select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]',
                isActive
                  ? 'text-white'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.label}
                {/* Animated underline bar — shared across all links */}
                {isActive && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ background: '#e50914' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
              </>
            )}
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
  );
}

/* ── Single active-aware link (reusable) ─────────────────────────────────────── */
export function AppNavLink({ to, children, end, className, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-2 rounded-xl text-sm font-medium',
          'transition-colors duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]',
          isActive
            ? 'text-white'
            : 'text-[var(--fg-muted)] hover:text-white',
          typeof className === 'function' ? '' : className,
        )
      }
    >
      {children}
    </NavLink>
  );
}
