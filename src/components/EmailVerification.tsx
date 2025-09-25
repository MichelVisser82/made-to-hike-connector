import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Missing token or email.');
        return;
      }

      try {
        console.log('Verifying email with token:', token, 'for email:', email);

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
      }
    };

    verifyEmail();
  }, [token, email, navigate, toast]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle>🏔️ {getTitle()}</CardTitle>
          <CardDescription>
            MadeToHike Email Verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={status === 'success' ? 'border-green-200 bg-green-50' : status === 'error' ? 'border-red-200 bg-red-50' : ''}>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>

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