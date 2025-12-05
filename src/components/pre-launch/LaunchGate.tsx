import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IS_LAUNCHED } from '@/config/launchConfig';
import { hasValidBypass, clearBypassToken, setBypassToken } from '@/utils/bypassAuth';
import { ComingSoonPage } from './ComingSoonPage';
import { SecretAccessModal } from './SecretAccessModal';
import { SEOWrapper } from '@/components/seo/SEOWrapper';
import { toast } from '@/hooks/use-toast';

// Routes that bypass the coming soon page and grant session access
const PUBLIC_BYPASS_ROUTES = ['/guide/invite'];

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
  const location = useLocation();

  // Check if current route is in public bypass list
  const isPublicBypassRoute = PUBLIC_BYPASS_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    // If on a public bypass route, grant session access
    if (isPublicBypassRoute && !hasValidBypass()) {
      setBypassToken();
      setHasBypass(true);
      return;
    }
    
    // Check bypass status on mount
    setHasBypass(hasValidBypass());

    // Add keyboard shortcut listener (Ctrl+Shift+L) - Toggle bypass
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        
        // Toggle: If user has bypass, clear it. Otherwise, open modal.
        if (hasBypass) {
          clearBypassToken();
          setHasBypass(false);
          toast({
            title: 'Returning to Coming Soon page',
            description: 'Press Ctrl+Shift+L again to access the site',
          });
        } else {
          setShowSecretModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [hasBypass, isPublicBypassRoute]);

  // If already launched, show full app with SEO wrapper
  if (IS_LAUNCHED) {
    return <SEOWrapper>{children}</SEOWrapper>;
  }

  // If route is in public bypass list, show full app
  if (isPublicBypassRoute) {
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

