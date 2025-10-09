import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle } from 'lucide-react';
import { hashPassword, setBypassToken, recordFailedAttempt, getRemainingAttempts } from '@/utils/bypassAuth';
import { BYPASS_PASSWORD_HASH } from '@/config/launchConfig';
import { useToast } from '@/hooks/use-toast';

interface SecretAccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function SecretAccessModal({ open, onClose }: SecretAccessModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      // Clear attempts when modal opens (for testing)
      sessionStorage.removeItem('mth_bypass_attempts');
      setRemainingAttempts(3);
      setPassword('');
      setError('');
      
      // Debug: Log the expected hash
      console.log('Expected password hash:', BYPASS_PASSWORD_HASH);
      console.log('To generate hash for a password, run in console:');
      console.log('crypto.subtle.digest("SHA-256", new TextEncoder().encode("your-password")).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("")))');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (remainingAttempts <= 0) {
      setError('Too many failed attempts. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const hashedInput = await hashPassword(password);
      
      console.log('🔐 Password Debug Info:');
      console.log('Entered password:', password);
      console.log('Generated hash:', hashedInput);
      console.log('Expected hash:', BYPASS_PASSWORD_HASH);
      console.log('Hashes match:', hashedInput === BYPASS_PASSWORD_HASH);
      
      if (hashedInput === BYPASS_PASSWORD_HASH) {
        setBypassToken();
        toast({
          title: 'Access granted',
          description: 'Redirecting to full site...',
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const canContinue = recordFailedAttempt();
        const newRemaining = getRemainingAttempts();
        setRemainingAttempts(newRemaining);
        
        if (!canContinue) {
          setError('Too many failed attempts. Please refresh the page to try again.');
        } else {
          setError(`Incorrect password. ${newRemaining} attempt${newRemaining !== 1 ? 's' : ''} remaining.`);
        }
        setPassword('');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-burgundy" />
            Secret Access
          </DialogTitle>
          <DialogDescription>
            Enter the preview password to access the full website
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || remainingAttempts <= 0}
              autoFocus
            />
            
            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-burgundy hover:bg-burgundy-dark"
              disabled={isLoading || remainingAttempts <= 0 || !password}
            >
              {isLoading ? 'Verifying...' : 'Access Site'}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Attempts remaining: {remainingAttempts}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
