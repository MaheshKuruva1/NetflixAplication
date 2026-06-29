/**
 * @file src/layouts/MainLayout.jsx
 * @description Primary layout: navigation system + main content + footer.
 * Uses AnimatePresence to orchestrate global page transitions for nested routes.
 */

import { useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { Navbar, NAVBAR_HEIGHT } from '@components/navigation';
import Footer         from '@components/common/Footer.jsx';
import SearchOverlay  from '@components/common/SearchOverlay.jsx';
import PageTransition from '@components/common/PageTransition.jsx';

export default function MainLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  /* Scroll to top on every route change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div
      id="layout-main"
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Navigation system */}
      <Navbar />

      {/* Full-screen search overlay */}
      <SearchOverlay />

      {/* Page content with global transitions */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        style={{ flex: 1, paddingTop: NAVBAR_HEIGHT, position: 'relative' }}
      >
        <AnimatePresence mode="wait">
          {/* Key ensures AnimatePresence detects route changes */}
          <PageTransition key={location.pathname}>
            {currentOutlet}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
