import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface CookieConsent {
  necessary: boolean;
  performance: boolean;
  functional: boolean;
  advertising: boolean;
}

interface CookieConsentContextValue {
  consent: CookieConsent | null;
  isInitialized: boolean;
  openPreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

declare global {
  interface Window {
    CookieFirst?: {
      consent?: CookieConsent;
      openPanel?: () => void;
    };
    cookiefirst_options?: {
      api_key: string;
    };
  }
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Load CookieFirst script dynamically - only if API key is configured
    const apiKey = import.meta.env.VITE_COOKIEFIRST_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '' || scriptLoaded.current) {
      // No API key - skip loading CookieFirst entirely
      // App still works, just without cookie consent banner
      setIsInitialized(true);
      return;
    }

    scriptLoaded.current = true;

    try {
      // Set options before loading script
      window.cookiefirst_options = {
        api_key: apiKey
      };

      // Create and append script
      const script = document.createElement('script');
      script.src = 'https://consent.cookiefirst.com/banner.js';
      script.setAttribute('data-cookiefirst-key', apiKey);
      script.async = true;
      script.onerror = () => {
        console.warn('CookieFirst script failed to load');
        setIsInitialized(true);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.warn('Error loading CookieFirst:', error);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    const handleCookieFirstInit = () => {
      if (window.CookieFirst?.consent) {
        setConsent(window.CookieFirst.consent);
      }
      setIsInitialized(true);
    };

    const handleCookieFirstConsent = () => {
      if (window.CookieFirst?.consent) {
        setConsent(window.CookieFirst.consent);
      }
    };

    // Listen to CookieFirst events
    window.addEventListener('cf_init', handleCookieFirstInit);
    window.addEventListener('cf_consent', handleCookieFirstConsent);

    // Check if already initialized
    if (window.CookieFirst?.consent) {
      handleCookieFirstInit();
    }

    return () => {
      window.removeEventListener('cf_init', handleCookieFirstInit);
      window.removeEventListener('cf_consent', handleCookieFirstConsent);
    };
  }, []);

  const openPreferences = () => {
    if (window.CookieFirst?.openPanel) {
      window.CookieFirst.openPanel();
    } else {
      console.warn('CookieFirst not initialized - cannot open preferences');
    }
  };

  // Always render children - never block rendering
  return (
    <CookieConsentContext.Provider value={{ consent, isInitialized, openPreferences }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsentContext() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsentContext must be used within a CookieConsentProvider');
  }
  return context;
}
