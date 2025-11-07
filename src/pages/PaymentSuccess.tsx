import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('Invalid payment session');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment-session', {
          body: { session_id: sessionId }
        });

        if (error) throw error;
        
        if (data.success && data.booking) {
          setBooking(data.booking);
        } else {
          setError('Failed to verify payment');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Verifying your payment...</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-destructive">
            <CardHeader>
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-destructive" />
                <CardTitle>Payment Verification Failed</CardTitle>
              </div>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-success">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <div>
                <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                <CardDescription>Your booking has been confirmed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {booking && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-lg">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Tour:</div>
                    <div className="font-medium">{booking.tours?.title}</div>
                    
                    <div className="text-muted-foreground">Booking Reference:</div>
                    <div className="font-mono text-xs">{booking.booking_reference}</div>
                    
                    <div className="text-muted-foreground">Date:</div>
                    <div>{new Date(booking.booking_date).toLocaleDateString()}</div>
                    
                    <div className="text-muted-foreground">Participants:</div>
                    <div>{booking.participants}</div>
                    
                    <div className="text-muted-foreground">Total Paid:</div>
                    <div className="font-semibold">€{(booking.total_price / 100).toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <p className="text-sm">
                    ✉️ A confirmation email has been sent to <strong>{booking.profiles?.email}</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              <Button onClick={() => navigate(`/dashboard?section=bookings&id=${booking?.id}`)}>
                View Booking Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
