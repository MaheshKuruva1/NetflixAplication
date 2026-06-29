/**
 * @file src/routes/guards/ProtectedRoute.jsx
 * @description Route guard that requires the user to be authenticated.
 * Redirects to /login while preserving the intended destination.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext.jsx';
import { ROUTES } from '@constants/routes.js';

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while auth state is being restored from localStorage
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-base)',
        }}
        aria-label="Loading..."
        role="status"
      >
        <div
          style={{
            width: 40,
            height: 40,
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

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
