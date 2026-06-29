/**
 * @file src/routes/AppRouter.jsx
 * @description Root router configuration using React Router DOM v7 with
 * nested layouts, lazy-loaded pages, and route guards.
 *
 * Pages are lazy-loaded via React.lazy() + Suspense for code-splitting.
 * Add new pages here by importing them lazily and placing them under the correct layout.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout, AuthLayout } from '@layouts/index.js';
import ProtectedRoute from './guards/ProtectedRoute.jsx';
import PublicRoute    from './guards/PublicRoute.jsx';
import { ROUTES }    from '@constants/routes.js';

// ─── Lazy Page Imports ────────────────────────────────────────────────────────
// Uncomment and create these files as you build each page:

const MovieDetailPage  = lazy(() => import('@pages/Detail/MovieDetailPage.jsx'));
const HomePage         = lazy(() => import('@pages/Home/HomePage.jsx'));
const SearchPage       = lazy(() => import('@pages/Search/SearchPage.jsx'));
const WatchlistPage    = lazy(() => import('@pages/MyList/WatchlistPage.jsx'));
const ProfilePage      = lazy(() => import('@pages/Profile/ProfilePage.jsx'));
const BrowsePage       = lazy(() => import('@pages/Browse/BrowsePage.jsx'));
const MoviesPage       = lazy(() => import('@pages/Movies/MoviesPage.jsx'));
const TVShowsPage      = lazy(() => import('@pages/TVShows/TVShowsPage.jsx'));
const TVDetailPage     = lazy(() => import('@pages/Detail/TVDetailPage.jsx'));
const LoginPage        = lazy(() => import('@pages/Auth/LoginPage.jsx'));
const SignupPage       = lazy(() => import('@pages/Auth/SignupPage.jsx'));
// const NotFoundPage     = lazy(() => import('@pages/NotFound/NotFoundPage.jsx'));

// ─── Fallback Spinner ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid var(--color-border-default)',
          borderTopColor: 'var(--color-brand-primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Placeholder pages (remove once real pages are implemented) ───────────────
const PlaceholderPage = ({ title }) => (
  <div
    className="container-app"
    style={{ padding: '6rem 0', textAlign: 'center', minHeight: '60vh' }}
  >
    <h1 className="text-display-md" style={{ color: 'var(--color-brand-primary)', marginBottom: '1rem' }}>
      {title}
    </h1>
    <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
      Page under construction. Build it in <code>src/pages/</code>.
    </p>
  </div>
);

// ─── Router ───────────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Public Auth Routes ── */}
          <Route element={<AuthLayout />}>
            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.SIGNUP}
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
          </Route>

          {/* ── Main App Routes (with Navbar + Footer) ── */}
          <Route element={<MainLayout />}>
            {/* Public browsing routes */}
            <Route index element={<HomePage />} />
            <Route path={ROUTES.BROWSE}    element={<BrowsePage />} />
            <Route path={ROUTES.MOVIES}    element={<MoviesPage />} />
            <Route path={ROUTES.MOVIES_GENRE} element={<MoviesPage />} />
            <Route path={ROUTES.TV_SHOWS}  element={<TVShowsPage />} />
            <Route path={ROUTES.TV_SHOWS_GENRE} element={<TVShowsPage />} />
            <Route path={ROUTES.NEW_POPULAR}   element={<BrowsePage />} />
            <Route path={ROUTES.ORIGINALS}     element={<BrowsePage />} />

            {/* Detail pages */}
            <Route path={ROUTES.MOVIE_DETAIL}  element={<MovieDetailPage />} />
            <Route path={ROUTES.TV_DETAIL}     element={<TVDetailPage />} />
            <Route path={ROUTES.PERSON_DETAIL} element={<PlaceholderPage title="Person" />} />
            <Route path={ROUTES.SEARCH} element={<SearchPage />} />

            {/* Protected routes */}
            <Route path={ROUTES.MY_LIST} element={<WatchlistPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

            {/* 404 */}
            <Route path="*" element={<PlaceholderPage title="404 – Page Not Found" />} />
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
