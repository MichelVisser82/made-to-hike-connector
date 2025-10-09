import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { IS_LAUNCHED } from '@/config/launchConfig';

interface SEOWrapperProps {
  children: ReactNode;
}

/**
 * SEOWrapper Component
 * 
 * Adds noindex, nofollow meta tags to all pages except homepage during pre-launch
 * This prevents search engines from indexing pages that aren't ready yet
 * 
 * When IS_LAUNCHED is true, this wrapper does nothing
 */
export function SEOWrapper({ children }: SEOWrapperProps) {
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  
  // If launched or on homepage, don't add noindex
  if (IS_LAUNCHED || isHomepage) {
    return <>{children}</>;
  }

  // Pre-launch: add noindex to all non-homepage pages
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {children}
    </>
  );
}
