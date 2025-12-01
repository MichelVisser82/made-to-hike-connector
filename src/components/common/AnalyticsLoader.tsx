import { useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export function AnalyticsLoader() {
  const { hasAnalyticsConsent, isInitialized } = useCookieConsent();

  useEffect(() => {
    if (!isInitialized) return;

    if (hasAnalyticsConsent()) {
      // Load Google Analytics or other analytics scripts here
      // Example:
      // const script = document.createElement('script');
      // script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      // script.async = true;
      // document.head.appendChild(script);
      
      console.log('Analytics consent granted - scripts can be loaded');
    } else {
      console.log('Analytics consent not granted - scripts not loaded');
    }
  }, [isInitialized, hasAnalyticsConsent]);

  return null;
}
