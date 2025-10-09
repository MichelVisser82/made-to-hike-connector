import { ReactNode, useEffect, useState } from 'react';
import { IS_LAUNCHED } from '@/config/launchConfig';
import { hasValidBypass } from '@/utils/bypassAuth';
import { ComingSoonPage } from './ComingSoonPage';
import { SecretAccessModal } from './SecretAccessModal';
import { SEOWrapper } from '@/components/seo/SEOWrapper';
import { clearSupabaseAuthCache } from '@/utils/authCleanup';

interface LaunchGateProps {
  children: ReactNode;
}

/**
 * LaunchGate Component
 * 
 * Controls access to the full website during pre-launch period
 * - If IS_LAUNCHED is true: Shows full app to everyone
 * - If IS_LAUNCHED is false: Shows Coming Soon page unless user has bypass token
 * - Keyboard shortcut Ctrl+Shift+L opens secret password modal
 */
export function LaunchGate({ children }: LaunchGateProps) {
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [hasBypass, setHasBypass] = useState(false);

  useEffect(() => {
    // Silently clear stale auth cache on mount for anonymous users
    if (!IS_LAUNCHED && !hasValidBypass()) {
      clearSupabaseAuthCache();
    }
    
    // Check bypass status on mount
    setHasBypass(hasValidBypass());

    // Add keyboard shortcut listener (Ctrl+Shift+L)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setShowSecretModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // If already launched, show full app with SEO wrapper
  if (IS_LAUNCHED) {
    return <SEOWrapper>{children}</SEOWrapper>;
  }

  // If user has bypass token, show full app with SEO wrapper
  if (hasBypass) {
    return <SEOWrapper>{children}</SEOWrapper>;
  }

  // Otherwise show Coming Soon page with secret access modal
  return (
    <>
      <ComingSoonPage />
      <SecretAccessModal
        open={showSecretModal}
        onClose={() => setShowSecretModal(false)}
      />
    </>
  );
}

