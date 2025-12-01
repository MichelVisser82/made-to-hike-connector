import React, { createContext, useContext, useEffect, useState } from 'react';

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
  }
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleCookieFirstInit = () => {
      if (window.CookieFirst?.consent) {
        setConsent(window.CookieFirst.consent);
        setIsInitialized(true);
      }
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
    }
  };

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
