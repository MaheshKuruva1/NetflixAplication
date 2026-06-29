/**
 * @file src/components/common/SectionHeader.jsx
 * @description Reusable section heading with title, subtitle, "See all" link, and animated entry.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowRightLine } from 'react-icons/ri';
import { cn } from '@utils/cn.js';

export default function SectionHeader({
  title,
  subtitle,
  to,            // "See all" link target
  linkLabel  = 'See all',
  badge,         // optional badge/chip next to title
  className,
  animate    = true,
}) {
  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      }
    : {};

  return (
    <Wrapper
      className={cn('section-header', className)}
      {...wrapperProps}
    >
      {/* Left: Title + Subtitle */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2
            className="type-heading-xl"
            style={{ color: 'var(--fg-primary)' }}
          >
            {title}
          </h2>
          {badge && badge}
        </div>
        {subtitle && (
          <p
            className="text-sm"
            style={{ color: 'var(--fg-muted)' }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: See all link */}
      {to && (
        <Link
          to={to}
          className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold
                     transition-all duration-150 group"
          style={{ color: '#e50914' }}
        >
          {linkLabel}
          <RiArrowRightLine
            className="text-base transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </Wrapper>
  );
}
