import { ReactNode, useEffect, useState } from 'react';
import { IS_LAUNCHED } from '@/config/launchConfig';
import { hasValidBypass } from '@/utils/bypassAuth';
import { ComingSoonPage } from './ComingSoonPage';
import { SecretAccessModal } from './SecretAccessModal';

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

  // If already launched, show full app
  if (IS_LAUNCHED) {
    return <>{children}</>;
  }

  // If user has bypass token, show full app
  if (hasBypass) {
    return <>{children}</>;
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

