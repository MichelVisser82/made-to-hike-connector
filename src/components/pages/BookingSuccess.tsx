import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [bookingReference, setBookingReference] = useState<string>('');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast.error('Invalid payment session');
        navigate('/');
        return;
      }

      try {
        // Verify payment session - this now creates the booking
        const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-payment-session', {
          body: { session_id: sessionId }
        });

        if (verificationError) {
          console.error('Payment verification error:', verificationError);
          toast.error(`Payment verification failed: ${verificationError.message}`);
          setIsProcessing(false);
          return;
        }

        if (!verificationData?.booking?.booking_reference) {
          console.error('No booking reference in response:', verificationData);
          toast.error('Invalid payment session data');
          setIsProcessing(false);
          return;
        }

        setBookingReference(verificationData.booking.booking_reference);
        toast.success('Booking confirmed!');
        setIsProcessing(false);

        // Redirect to dashboard after brief delay
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              bookingSuccess: true,
              bookingReference: verificationData.booking.booking_reference 
            }
          });
        }, 2000);

      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast.error(`Error: ${error.message || 'An error occurred. Please contact support.'}`);
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Processing your booking...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment and create your booking.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was successful and your booking has been confirmed.
        </p>
        
        {bookingReference && (
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm font-medium mb-1">Booking Reference</p>
            <p className="text-2xl font-bold">{bookingReference}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-6">
          You will receive a confirmation email shortly with all the details of your booking.
        </p>

        <div className="flex gap-4">
          <Button onClick={() => navigate('/dashboard')} className="flex-1">
            View My Bookings
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};
