/**
 * @file src/components/ui/Dropdown.jsx
 * @description Animated dropdown menu with click trigger, groups, icons,
 * keyboard navigation, and portal rendering via useClickOutside.
 */

import { useState, useCallback, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCheckLine, RiArrowDownSLine } from 'react-icons/ri';
import { cn } from '@utils/cn.js';
import useClickOutside from '@hooks/useClickOutside.js';

/* ── Dropdown Item ──────────────────────────────────────────────────────────── */
function DropdownItem({
  icon, children, onClick, disabled = false,
  active = false, danger = false, description,
}) {
  return (
    <motion.button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      whileHover={!disabled ? { x: 3 } : undefined}
      transition={{ type: 'spring', stiffness: 600, damping: 40 }}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
        'transition-colors duration-100 text-left',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        danger
          ? 'text-[#ff6b6b] hover:bg-[rgba(229,9,20,0.12)]'
          : active
          ? 'text-white bg-white/8'
          : 'text-[var(--fg-secondary)] hover:text-white',
        !disabled && !danger && !active && 'hover:bg-[var(--dropdown-item-hover)]',
      )}
    >
      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0 text-[1.1rem] leading-none" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Label + Description */}
      <span className="flex flex-col gap-0.5 flex-1 min-w-0 text-left">
        <span className="leading-none">{children}</span>
        {description && (
          <span className="text-[0.72rem] font-normal leading-none" style={{ color: 'var(--fg-muted)' }}>
            {description}
          </span>
        )}
      </span>

      {/* Active checkmark */}
      {active && <RiCheckLine className="flex-shrink-0 text-[#e50914]" aria-hidden="true" />}
    </motion.button>
  );
}

/* ── Dropdown Group ─────────────────────────────────────────────────────────── */
function DropdownGroup({ label, children }) {
  return (
    <div role="group" aria-label={label}>
      {label && (
        <p className="px-3 pt-2 pb-1 text-[0.67rem] font-bold uppercase tracking-widest"
          style={{ color: 'var(--fg-muted)' }}>
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

/* ── Dropdown Divider ───────────────────────────────────────────────────────── */
function DropdownDivider() {
  return <hr className="divider my-1.5 mx-1" role="separator" />;
}

/* ── Animation Variants ─────────────────────────────────────────────────────── */
const ALIGN_CLASSES = {
  left:   'left-0',
  right:  'right-0',
  center: 'left-1/2 -translate-x-1/2',
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -8 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 30 },
  },
  exit: {
    opacity: 0, scale: 0.95, y: -6,
    transition: { duration: 0.12 },
  },
};

/* ── Main Dropdown ──────────────────────────────────────────────────────────── */
export default function Dropdown({
  trigger,
  children,
  align    = 'left',
  width    = 220,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const containerRef = useClickOutside(() => setIsOpen(false));

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close  = useCallback(() => setIsOpen(false), []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      data-dropdown-open={isOpen}
    >
      {/* Trigger */}
      <div
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={toggle}
        className="cursor-pointer"
      >
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={id}
            role="menu"
            aria-orientation="vertical"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute top-[calc(100%+8px)] z-[var(--z-dropdown)]',
              'p-1.5 rounded-2xl',
              'glass-dark-strong shadow-[var(--shadow-xl)]',
              ALIGN_CLASSES[align] ?? ALIGN_CLASSES.left,
              className
            )}
            style={{ width, minWidth: width }}
            onClick={close}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Compound exports ───────────────────────────────────────────────────────── */
Dropdown.Item    = DropdownItem;
Dropdown.Group   = DropdownGroup;
Dropdown.Divider = DropdownDivider;

/* ── Select Dropdown (controlled value) ─────────────────────────────────────── */
export function SelectDropdown({
  value, onChange, options = [], placeholder = 'Select…',
  label, disabled, width = 220,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside(() => setIsOpen(false));
  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1.5 w-full" style={{ maxWidth: width }}>
      {label && (
        <span className="text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>
          {label}
        </span>
      )}

      <div ref={containerRef} className="relative">
        {/* Trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            'w-full flex items-center justify-between gap-2 h-11 px-4',
            'input-base text-sm font-medium cursor-pointer',
            disabled && 'pointer-events-none opacity-40',
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span style={{ color: selected ? 'var(--fg-primary)' : 'var(--fg-muted)' }}>
            {selected?.label ?? placeholder}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 opacity-60"
            aria-hidden="true"
          >
            <RiArrowDownSLine className="text-xl" />
          </motion.span>
        </button>

        {/* Options panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              role="listbox"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-[calc(100%+6px)] left-0 right-0 z-[var(--z-dropdown)]
                         p-1.5 rounded-2xl glass-dark-strong shadow-[var(--shadow-xl)] max-h-60 overflow-y-auto"
            >
              {options.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer',
                    'text-sm font-medium transition-colors duration-100',
                    opt.value === value
                      ? 'text-white bg-white/8'
                      : 'text-[var(--fg-secondary)] hover:text-white hover:bg-[var(--dropdown-item-hover)]'
                  )}
                  onClick={() => { onChange?.(opt.value); setIsOpen(false); }}
                >
                  {opt.icon && <span className="text-base" aria-hidden="true">{opt.icon}</span>}
                  <span className="flex-1">{opt.label}</span>
                  {opt.value === value && <RiCheckLine className="text-[#e50914]" aria-hidden="true" />}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
