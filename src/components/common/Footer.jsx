/**
 * @file src/components/common/Footer.jsx
 * @description Streaming platform footer with links, social icons, and legal info.
 */

import { Link } from 'react-router-dom';
import {
  RiTwitterXLine, RiInstagramLine, RiFacebookCircleLine,
  RiYoutubeLine, RiGithubLine,
} from 'react-icons/ri';
import { ROUTES } from '@constants/routes.js';

/* ── Link Columns ───────────────────────────────────────────────────────────── */
const FOOTER_COLUMNS = [
  {
    heading: 'Browse',
    links: [
      { label: 'Movies',       to: ROUTES.MOVIES },
      { label: 'TV Shows',     to: ROUTES.TV_SHOWS },
      { label: 'New & Popular',to: ROUTES.NEW_POPULAR },
      { label: 'My List',      to: ROUTES.MY_LIST },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'FAQ',          to: '/' },
      { label: 'Cookie Preferences', to: '/' },
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms of Use', to: '/' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In',      to: ROUTES.LOGIN },
      { label: 'Sign Up',      to: ROUTES.SIGNUP },
      { label: 'Profile',      to: ROUTES.PROFILE },
      { label: 'Settings',     to: '/' },
    ],
  },
];

const SOCIALS = [
  { Icon: RiTwitterXLine,       label: 'Twitter / X',  href: '#' },
  { Icon: RiInstagramLine,      label: 'Instagram',    href: '#' },
  { Icon: RiFacebookCircleLine, label: 'Facebook',     href: '#' },
  { Icon: RiYoutubeLine,        label: 'YouTube',      href: '#' },
];

/* ── Footer ─────────────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
      aria-label="Site footer"
    >
      {/* ── Main content ── */}
      <div className="container-app py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-4">
            {/* Logo */}
            <Link to={ROUTES.HOME} aria-label="BappamMovies Home">
              <span className="font-display font-black text-xl tracking-tighter">
                <span style={{ color: '#e50914' }}>Bappam</span>
                <span style={{ color: 'var(--fg-secondary)' }}>Movies</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--fg-muted)' }}>
              Your ultimate destination for movies, TV shows, and originals.
              Stream anytime, anywhere.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-lg
                             transition-all duration-150"
                  style={{
                    color: 'var(--fg-muted)',
                    border: '1px solid var(--border-default)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--fg-muted)';
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                >
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-3">
              <h3
                className="type-label-sm"
                style={{ color: 'var(--fg-tertiary)' }}
              >
                {heading}
              </h3>
              <ul className="flex flex-col gap-2" role="list">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm transition-colors duration-150 hover:text-white"
                      style={{ color: 'var(--fg-muted)' }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="border-t px-[clamp(1rem,4vw,5rem)] py-5 flex flex-col sm:flex-row
                   items-center justify-between gap-3"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
          © {new Date().getFullYear()} BappamMovies. All rights reserved.
        </p>
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
          Powered by{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            TMDB
          </a>
          . Content for educational purposes only.
        </p>
      </div>
    </footer>
  );
}
