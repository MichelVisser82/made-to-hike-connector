import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { X, Settings, Palette } from 'lucide-react';

export function WireframeNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [decisions, setDecisions] = useState<any>(null);

  useEffect(() => {
    const checkForNewDecisions = () => {
      try {
        const savedDecisions = localStorage.getItem('madetohike-wireframe-decisions');
        const lastNotified = localStorage.getItem('madetohike-last-notified');
        
        if (savedDecisions) {
          const currentDecisions = JSON.parse(savedDecisions);
          const decisionsTimestamp = localStorage.getItem('madetohike-wireframe-timestamp') || Date.now().toString();
          
          // Show notification if decisions exist and haven't been notified recently
          if (!lastNotified || parseInt(lastNotified) < parseInt(decisionsTimestamp)) {
            setDecisions(currentDecisions);
            setShowNotification(true);
          }
        }
      } catch (error) {
        console.error('Failed to check wireframe decisions:', error);
      }
    };

    checkForNewDecisions();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'madetohike-wireframe-decisions') {
        checkForNewDecisions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleDismiss = () => {
    setShowNotification(false);
    localStorage.setItem('madetohike-last-notified', Date.now().toString());
  };

  const goToSettings = () => {
    handleDismiss();
    // Navigate to settings page
    window.location.hash = '#settings';
  };

  if (!showNotification || !decisions) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw]">
      <Card className="border-primary/20 bg-background shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Palette className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Configuration Applied</h4>
                <p className="text-xs text-muted-foreground">Your marketplace settings are active</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {decisions.branding?.siteName || 'MadeToHike'}
              </Badge>
              {decisions.features?.userReviews && (
                <Badge variant="secondary" className="text-xs">Reviews</Badge>
              )}
              {decisions.features?.multiCurrency && (
                <Badge variant="secondary" className="text-xs">Multi-Currency</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {decisions.marketplace?.commissionRate || 15}% Commission
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToSettings}
              className="flex-1 text-xs gap-1"
            >
              <Settings className="h-3 w-3" />
              Modify Settings
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDismiss}
              className="text-xs"
            >
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}