import { useCookieConsentContext } from '@/contexts/CookieConsentContext';

export function useCookieConsent() {
  const { consent, isInitialized, openPreferences } = useCookieConsentContext();
  
  const hasAnalyticsConsent = () => consent?.performance ?? false;
  const hasMarketingConsent = () => consent?.advertising ?? false;
  const hasFunctionalConsent = () => consent?.functional ?? false;
  
  return {
    consent,
    isInitialized,
    openPreferences,
    hasAnalyticsConsent,
    hasMarketingConsent,
    hasFunctionalConsent,
  };
}
