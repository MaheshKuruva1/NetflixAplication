/**
 * @file src/pages/index.js
 * @description Barrel export for all page components.
 *
 * Page structure convention:
 *   src/pages/
 *   ├── Home/
 *   │   └── HomePage.jsx
 *   ├── Browse/
 *   │   └── BrowsePage.jsx
 *   ├── Movies/
 *   │   ├── MoviesPage.jsx
 *   │   └── components/        (page-specific sub-components)
 *   ├── TVShows/
 *   │   └── TVShowsPage.jsx
 *   ├── Detail/
 *   │   ├── MovieDetailPage.jsx
 *   │   └── TVDetailPage.jsx
 *   ├── Search/
 *   │   └── SearchPage.jsx
 *   ├── MyList/
 *   │   └── MyListPage.jsx
 *   ├── Auth/
 *   │   ├── LoginPage.jsx
 *   │   └── SignupPage.jsx
 *   ├── Profile/
 *   │   └── ProfilePage.jsx
 *   └── NotFound/
 *       └── NotFoundPage.jsx
 */

// Lazy imports are handled in AppRouter.jsx for code-splitting.
// Only re-export here if you need eager imports for testing.
