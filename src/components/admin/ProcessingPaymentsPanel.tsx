import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ProcessingBooking {
  id: string;
  booking_reference: string;
  created_at: string;
  payment_status: string;
  total_price: number;
  currency: string;
  stripe_payment_intent_id: string;
  profiles: {
    name: string;
    email: string;
  };
  tours: {
    title: string;
  };
}

export const ProcessingPaymentsPanel = () => {
  const [bookings, setBookings] = useState<ProcessingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProcessingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          created_at,
          payment_status,
          total_price,
          currency,
          stripe_payment_intent_id,
          profiles!bookings_hiker_id_fkey (name, email),
          tours!bookings_tour_id_fkey (title)
        `)
        .eq('payment_status', 'processing')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data as any || []);
    } catch (error) {
      console.error('Error fetching processing bookings:', error);
      toast.error('Failed to load processing payments');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshStatus = async (bookingId: string, paymentIntentId: string) => {
    setIsRefreshing(true);
    try {
      // Call Stripe to check current status
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { payment_intent_id: paymentIntentId }
      });

      if (error) throw error;

      if (data.status === 'succeeded') {
        toast.success('Payment completed! Booking confirmed.');
        await fetchProcessingBookings();
      } else if (data.status === 'processing') {
        toast.info('Payment still processing. SEPA payments can take 3-5 business days.');
      } else {
        toast.warning(`Payment status: ${data.status}`);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Failed to check payment status');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProcessingBookings();

    // Set up realtime subscription
    const subscription = supabase
      .channel('processing_bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: 'payment_status=eq.processing',
        },
        () => {
          fetchProcessingBookings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Processing Payments</h2>
          <p className="text-sm text-muted-foreground">
            Monitor SEPA and other delayed payment methods
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setIsRefreshing(true);
            fetchProcessingBookings();
          }}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Refresh
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-muted-foreground">No payments currently processing</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Processing
                    </Badge>
                    <span className="font-mono text-sm font-medium">
                      {booking.booking_reference}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold">{booking.tours.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.profiles.name} ({booking.profiles.email})
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">
                      {booking.currency === 'EUR' ? '€' : booking.currency === 'GBP' ? '£' : '$'}
                      {booking.total_price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(booking.created_at), 'PPp')}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">SEPA Payment Processing</p>
                      <p>
                        Payment will be automatically confirmed when the bank transfer completes
                        (typically 3-5 business days). The booking is confirmed and the guide has
                        been notified.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshStatus(booking.id, booking.stripe_payment_intent_id)}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Check Status'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};
