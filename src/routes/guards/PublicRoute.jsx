/**
 * @file src/routes/guards/PublicRoute.jsx
 * @description Route guard for public-only pages (login, signup).
 * Redirects authenticated users to HOME or their intended destination.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext.jsx';
import { ROUTES } from '@constants/routes.js';

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? ROUTES.HOME;

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return children;
}
