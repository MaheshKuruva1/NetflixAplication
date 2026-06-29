/**
 * @file src/pages/Profile/ProfilePage.jsx
 * @description User profile and settings dashboard.
 *
 * Sections:
 * - Avatar & Account Info
 * - Quick Stats (Watchlist Count, Watch History)
 * - Favorite Genres
 * - App Settings (Theme, Language, Notifications)
 * - Legal (About, Privacy)
 * - Logout Button
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiUser3Line,
  RiSettings4Line,
  RiGlobalLine,
  RiNotification4Line,
  RiInformationLine,
  RiShieldKeyholeLine,
  RiLogoutBoxRLine,
  RiHistoryLine,
  RiHeartLine,
  RiArrowRightSLine,
  RiEdit2Line,
  RiPaintBrushLine,
} from 'react-icons/ri';

import { useAuth } from '@context/AuthContext.jsx';
import { useWatchlist } from '@context/WatchlistContext.jsx';
import { Avatar } from '@components/ui';
import { SEO } from '@components/common';
import { cn } from '@utils/cn.js';

/* ─── Mock Data ──────────────────────────────────────────────────────────── */
const FAVORITE_GENRES = ['Action', 'Sci-Fi', 'Thriller', 'Animation'];

const WATCH_HISTORY = [
  { id: 1, title: 'Inception', date: '2 days ago', progress: 100 },
  { id: 2, title: 'The Matrix', date: '5 days ago', progress: 100 },
  { id: 3, title: 'Stranger Things S4 E1', date: '1 week ago', progress: 45 },
];

/* ─── Components ─────────────────────────────────────────────────────────── */

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-xl" style={{ color: 'var(--fg-secondary)' }}>
        <Icon aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold" style={{ color: 'var(--fg-primary)' }}>
        {title}
      </h2>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, value, onClick, highlight = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full flex items-center justify-between p-4 rounded-2xl transition-colors text-left',
        highlight ? 'hover:bg-[#e50914]/10' : 'hover:bg-white/5'
      )}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg text-lg"
          style={{
            background: highlight ? 'rgba(229,9,20,0.1)' : 'var(--bg-surface)',
            color: highlight ? '#e50914' : 'var(--fg-secondary)',
          }}
        >
          <Icon aria-hidden="true" />
        </div>
        <span className="font-semibold text-sm" style={{ color: highlight ? '#ff6b6b' : 'var(--fg-primary)' }}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {value && (
          <span className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            {value}
          </span>
        )}
        <RiArrowRightSLine className="text-xl" style={{ color: 'var(--fg-muted)' }} aria-hidden="true" />
      </div>
    </motion.button>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex-1 p-5 rounded-2xl flex flex-col items-start gap-3"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl text-lg"
        style={{ background: `${color}15`, color }}
      >
        <Icon aria-hidden="true" />
      </div>
      <div>
        <div className="text-2xl font-black" style={{ color: 'var(--fg-primary)' }}>
          {value}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: 'var(--fg-muted)' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { watchlist } = useWatchlist();

  // Fallbacks if not logged in (since we made route public for testing)
  const displayName = user?.name || 'Guest User';
  const displayEmail = user?.email || 'guest@example.com';
  const isPremium = user?.plan === 'premium';

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 pt-8 pb-24 flex justify-center"
      style={{ background: 'var(--bg-base)' }}
    >
      <SEO title="My Profile" />
      <div className="w-full max-w-5xl space-y-12">

        {/* ─── Hero / Account Info ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
          }}
        >
          {/* Decorative background glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#e50914] rounded-full blur-[120px] opacity-10 pointer-events-none" />

          {/* Avatar Wrapper */}
          <div className="relative group">
            <Avatar
              src={user?.avatar}
              alt={displayName}
              size="2xl"
              name={displayName}
              className="border-4 border-[var(--bg-base)] shadow-2xl"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: '#e50914', color: 'white' }}
              aria-label="Edit avatar"
            >
              <RiEdit2Line size={14} />
            </button>
          </div>

          <div className="flex-1 mt-2">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
              <h1 className="text-3xl font-black" style={{ color: 'var(--fg-primary)' }}>
                {displayName}
              </h1>
              {isPremium && (
                <span className="px-2 py-0.5 rounded text-[0.65rem] font-black tracking-widest uppercase bg-gradient-to-r from-[#e50914] to-[#ff6b6b] text-white shadow-lg">
                  Premium
                </span>
              )}
            </div>
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--fg-muted)' }}>
              {displayEmail}
            </p>

            <button
              type="button"
              className="h-9 px-4 rounded-xl text-sm font-bold text-white transition-colors hover:brightness-110 shadow-lg shadow-red-500/20"
              style={{ background: '#e50914' }}
            >
              Manage Subscription
            </button>
          </div>
        </motion.section>

        {/* ─── Quick Stats ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-2 snap-x hide-scrollbar"
        >
          <StatCard
            icon={RiHeartLine}
            label="In Watchlist"
            value={watchlist.length}
            color="#e50914"
          />
          <StatCard
            icon={RiHistoryLine}
            label="Titles Watched"
            value={WATCH_HISTORY.length * 42} // Fake multiplier for demo
            color="#00d4ff"
          />
          <div
            className="flex-1 p-5 rounded-2xl flex flex-col min-w-[200px] snap-center"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-muted)' }}>
              Top Genres
            </div>
            <div className="flex flex-wrap gap-2">
              {FAVORITE_GENRES.map(genre => (
                <span
                  key={genre}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--bg-surface)', color: 'var(--fg-primary)' }}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── Settings Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* App Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 sm:p-8 rounded-3xl flex flex-col gap-6"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            <SectionHeader icon={RiSettings4Line} title="App Settings" />
            <div className="flex flex-col gap-3">
              <SettingsRow icon={RiPaintBrushLine} label="Theme" value="Dark" />
              <SettingsRow icon={RiGlobalLine} label="Language" value="English" />
              <SettingsRow icon={RiNotification4Line} label="Notifications" value="Enabled" />
            </div>
          </motion.section>

          {/* Account & Legal */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 sm:p-8 rounded-3xl flex flex-col gap-6"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            <SectionHeader icon={RiUser3Line} title="Account & Legal" />
            <div className="flex flex-col gap-3">
              <SettingsRow icon={RiShieldKeyholeLine} label="Privacy & Data" />
              <SettingsRow icon={RiInformationLine} label="About BappamMovies" value="v1.0.0" />
              <SettingsRow 
                icon={RiLogoutBoxRLine} 
                label="Sign Out" 
                highlight 
                onClick={logout} 
              />
            </div>
          </motion.section>
        </div>

        {/* ─── Watch History (Preview) ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 sm:p-8 rounded-3xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={RiHistoryLine} title="Recent Watch History" />
            <button className="text-sm font-bold hover:underline" style={{ color: '#00d4ff' }}>
              View All
            </button>
          </div>
          
          <div className="grid gap-3">
            {WATCH_HISTORY.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
              >
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--fg-primary)' }}>
                    {item.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                    Watched {item.date}
                  </div>
                </div>
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: `${item.progress}%`, background: item.progress === 100 ? '#00d4ff' : '#e50914' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}
