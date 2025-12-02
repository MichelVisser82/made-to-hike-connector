import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !GA_MEASUREMENT_ID) return;
    initialized.current = true;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    // Set default consent state to DENIED (GDPR requirement)
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted',
      'wait_for_update': 500,
    });

    // Load gtag.js script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize GA4
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
    });

    // Listen for CookieFirst consent changes
    const handleConsentChange = (event: CustomEvent) => {
      const consent = event.detail;
      
      gtag('consent', 'update', {
        'analytics_storage': consent?.performance ? 'granted' : 'denied',
        'ad_storage': consent?.advertising ? 'granted' : 'denied',
        'ad_user_data': consent?.advertising ? 'granted' : 'denied',
        'ad_personalization': consent?.advertising ? 'granted' : 'denied',
        'functionality_storage': consent?.functional ? 'granted' : 'denied',
        'personalization_storage': consent?.functional ? 'granted' : 'denied',
      });
    };

    window.addEventListener('cf_consent', handleConsentChange as EventListener);

    // Check if consent was already given (returning visitor)
    if (window.CookieFirst?.consent) {
      const consent = window.CookieFirst.consent;
      gtag('consent', 'update', {
        'analytics_storage': consent?.performance ? 'granted' : 'denied',
        'ad_storage': consent?.advertising ? 'granted' : 'denied',
        'ad_user_data': consent?.advertising ? 'granted' : 'denied',
        'ad_personalization': consent?.advertising ? 'granted' : 'denied',
        'functionality_storage': consent?.functional ? 'granted' : 'denied',
        'personalization_storage': consent?.functional ? 'granted' : 'denied',
      });
    }

    return () => {
      window.removeEventListener('cf_consent', handleConsentChange as EventListener);
    };
  }, []);

  return null;
}
