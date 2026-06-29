/**
 * @file src/layouts/AuthLayout.jsx
 * @description Full-screen cinematic layout for login/signup pages.
 * No navbar or footer — just a centred card over a blurred backdrop.
 */

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext.jsx';
import { ROUTES } from '@constants/routes.js';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users away from auth pages
  if (!isLoading && isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div
      id="layout-auth"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(229,9,20,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.05) 0%, transparent 50%),
          var(--color-bg-base)
        `,
        padding: '2rem 1rem',
      }}
    >
      {/* Decorative grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      <main
        id="auth-content"
        role="main"
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
