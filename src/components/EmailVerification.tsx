import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading');
  const [message, setMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const urlToken = searchParams.get('token');
  const urlEmail = searchParams.get('email');

  const verifyEmailWithToken = async (token: string, email: string) => {
    try {
      console.log('Verifying email...');
      setIsVerifying(true);

      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: {
          token,
          email: decodeURIComponent(email)
        }
      });

      if (error) {
        console.error('Verification error:', error);
        throw new Error(error.message || 'Verification failed');
      }

      console.log('Email verified successfully:', data);
      setStatus('success');
      setMessage('Your email has been verified successfully! You can now sign in to your account.');

      toast({
        title: 'Email Verified!',
        description: 'Welcome to MadeToHike! You can now sign in.',
      });

      // Redirect to sign in page after a delay
      setTimeout(() => {
        navigate('/auth?mode=signin');
      }, 3000);

    } catch (error: any) {
      console.error('Email verification failed:', error);
      setStatus('error');
      setMessage(error.message || 'Email verification failed. Please try again or contact support.');

      toast({
        title: 'Verification Failed',
        description: error.message || 'Unable to verify your email',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // If no URL params, show manual entry form
    if (!urlToken && !urlEmail) {
      setStatus('manual');
      setMessage('Please enter your email and verification code from the email we sent you.');
      return;
    }

    // If we have URL params but they're incomplete
    if (!urlToken || !urlEmail) {
      setStatus('manual');
      setMessage('Invalid verification link. Please enter your details manually.');
      if (urlEmail) setManualEmail(urlEmail);
      if (urlToken) setManualToken(urlToken);
      return;
    }

    // Auto-verify with URL params
    verifyEmailWithToken(urlToken, urlEmail);
  }, [urlToken, urlEmail, navigate, toast]);

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken || !manualEmail) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and verification code',
        variant: 'destructive',
      });
      return;
    }
    await verifyEmailWithToken(manualToken, manualEmail);
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'manual':
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      case 'manual':
        return 'Email Verification';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          {getIcon() && (
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
          )}
          <CardTitle>🏔️ {getTitle()}</CardTitle>
          <CardDescription>
            MadeToHike Email Verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={status === 'success' ? 'border-green-200 bg-green-50' : status === 'error' ? 'border-red-200 bg-red-50' : ''}>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'manual' && (
            <form onSubmit={handleManualVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter verification code from email"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Redirecting to sign in page in a few seconds...
              </p>
              <Button 
                onClick={() => navigate('/auth?mode=signin')}
                className="w-full"
              >
                Sign In Now
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/auth?mode=signup')}
                className="w-full"
              >
                Try Signing Up Again
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};