/**
 * @file src/components/ui/Rating.jsx
 * @description TMDB-style circular SVG rating ring with color-coded quality levels.
 * Also exports StarRating for a more traditional star display.
 */

import { cn } from '@utils/cn.js';

/* ── Color thresholds ───────────────────────────────────────────────────────── */
function getRatingColor(pct) {
  if (pct >= 80) return { stroke: '#00c864', trackStroke: '#003d1e', text: '#00c864' };
  if (pct >= 60) return { stroke: '#f5a623', trackStroke: '#4a3300', text: '#f5a623' };
  if (pct >= 40) return { stroke: '#00d4ff', trackStroke: '#003a44', text: '#00d4ff' };
  return             { stroke: '#e50914', trackStroke: '#44000a', text: '#e50914' };
}

/* ── Sizes ─────────────────────────────────────────────────────────────────── */
const SIZES = {
  xs: { svg: 32, sw: 3,   textSize: '8px',  fontW: '700' },
  sm: { svg: 44, sw: 3.5, textSize: '11px', fontW: '700' },
  md: { svg: 60, sw: 4,   textSize: '13px', fontW: '800' },
  lg: { svg: 76, sw: 4.5, textSize: '16px', fontW: '800' },
  xl: { svg: 96, sw: 5,   textSize: '20px', fontW: '900' },
};

/* ── CircleRating ───────────────────────────────────────────────────────────── */
export default function Rating({
  value  = 0,  // 0–10 TMDB score
  total  = 10,
  size   = 'md',
  showLabel = false,
  className,
}) {
  const s = SIZES[size] ?? SIZES.md;
  const pct      = Math.round((value / total) * 100);
  const colors   = getRatingColor(pct);
  const center   = s.svg / 2;
  const radius   = center - s.sw - 2;
  const circumference = 2 * Math.PI * radius;
  const dash     = (pct / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg
        width={s.svg} height={s.svg}
        viewBox={`0 0 ${s.svg} ${s.svg}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`Rating: ${value} out of ${total}`}
        role="img"
      >
        {/* Background circle */}
        <circle
          cx={center} cy={center} r={radius}
          fill="rgba(10,10,15,0.8)"
          stroke={colors.trackStroke}
          strokeWidth={s.sw}
        />
        {/* Progress arc */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={s.sw}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }}
        />
        {/* Center text */}
        <text
          x={center} y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.text}
          fontSize={s.textSize}
          fontWeight={s.fontW}
          style={{ transform: `rotate(90deg)`, transformOrigin: `${center}px ${center}px` }}
        >
          {pct}
          <tspan fontSize={Math.max(6, parseFloat(s.textSize) * 0.65)} fill={colors.text} dy="-0.5">%</tspan>
        </text>
      </svg>

      {showLabel && (
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest"
          style={{ color: colors.text }}>
          {pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Mixed' : 'Poor'}
        </span>
      )}
    </div>
  );
}

/* ── Star Rating ────────────────────────────────────────────────────────────── */
export function StarRating({
  value  = 0,   // 0–10
  total  = 10,
  stars  = 5,
  size   = 'md',
  className,
}) {
  const filled = Math.round((value / total) * stars * 2) / 2; // half-star precision
  const starSize = { xs: 10, sm: 12, md: 16, lg: 20, xl: 24 }[size] ?? 16;
  const count = { xs: 249, sm: 247 }; // not used, just for ref

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`${value} out of ${total} rating`}
      role="img"
    >
      {Array.from({ length: stars }, (_, i) => {
        const fill = Math.min(1, Math.max(0, filled - i));
        return (
          <Star key={i} fill={fill} size={starSize} />
        );
      })}
      <span className="ml-1.5 text-xs font-semibold" style={{ color: 'var(--fg-secondary)' }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function Star({ fill, size }) {
  const id = `star-clip-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      {/* Empty star */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#333350"
      />
      {/* Filled star */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#f5a623"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}

/* ── Inline Score Badge ─────────────────────────────────────────────────────── */
export function ScoreBadge({ value = 0, className }) {
  const pct = Math.round((value / 10) * 100);
  const colors = getRatingColor(pct);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold',
        className
      )}
      style={{
        background: colors.trackStroke,
        color: colors.text,
        border: `1px solid ${colors.stroke}40`,
      }}
      aria-label={`Score: ${value}`}
    >
      ★ {value.toFixed(1)}
    </span>
  );
}
