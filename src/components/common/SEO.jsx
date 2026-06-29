/**
 * @file src/components/common/SEO.jsx
 * @description Centralized SEO component for dynamic metadata management.
 * Uses react-helmet-async to inject tags into the document <head>.
 */

import { Helmet } from 'react-helmet-async';
import ENV from '@config/env.js';

export default function SEO({ 
  title, 
  description = 'BappamMovies - The ultimate premium streaming experience.',
  image,
  type = 'website'
}) {
  const fullTitle = title ? `${title} | ${ENV.APP_NAME}` : ENV.APP_NAME;
  
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph (Facebook / LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={ENV.APP_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
