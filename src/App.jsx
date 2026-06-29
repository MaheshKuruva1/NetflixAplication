/**
 * @file src/App.jsx
 * @description Application root — context providers + router + global UI (Toast).
 *
 * Provider order:
 *   AuthProvider      → must wrap everything
 *   UIProvider        → UI state (modals, search) needed by layouts
 *   WatchlistProvider → depends on auth for user-specific data
 *   ToastProvider     → global toast notifications (renders portal)
 */

import { AuthProvider }      from '@context/AuthContext.jsx';
import { UIProvider }        from '@context/UIContext.jsx';
import { WatchlistProvider } from '@context/WatchlistContext.jsx';
import { ToastProvider }     from '@components/common/Toast.jsx';
import { HelmetProvider }    from 'react-helmet-async';
import AppRouter             from '@routes/AppRouter.jsx';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <UIProvider>
          <WatchlistProvider>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </WatchlistProvider>
        </UIProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
