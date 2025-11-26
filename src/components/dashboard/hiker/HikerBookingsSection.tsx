import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MapPin, Users, Download, FileText, MessageSquare, CheckCircle2, Calendar, Clock, AlertCircle, Eye } from 'lucide-react';
import { useHikerBookings } from '@/hooks/useHikerBookings';
import { ReceiptViewer } from '@/components/booking/ReceiptViewer';
import { format } from 'date-fns';

interface HikerBookingsSectionProps {
  userId: string;
  onViewBooking: (bookingId: string) => void;
  onContactGuide: (guideId: string) => void;
}

export function HikerBookingsSection({ userId, onViewBooking, onContactGuide }: HikerBookingsSectionProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const { bookings, loading, error } = useHikerBookings(userId);

  // Filter bookings by status - show all non-cancelled, non-completed bookings as active
  const activeBookings = bookings.filter(b => {
    const status = b.status.toLowerCase();
    return !['cancelled', 'completed', 'refunded'].includes(status);
  });

  const completedBookings = bookings.filter(b => 
    b.status.toLowerCase() === 'completed'
  );

  // Mock data for features not yet implemented
  const oldActiveBookings = [
    {
      id: '1',
      bookingRef: 'MTH-2025-10847',
      title: 'Mont Blanc Summit Trek',
      dates: 'October 15-17, 2025',
      location: 'Chamonix, France',
      guide: 'Sarah Mountain',
      guideId: 'guide1',
      guests: 2,
      amount: 890,
      status: 'confirmed',
      paymentStatus: 'paid_full'
    },
  ];

  // Transform bookings into payment history
  const paymentHistory = bookings
    .filter(b => b.payment_status.toLowerCase() !== 'pending')
    .map(booking => ({
      id: booking.id,
      description: `${booking.tours?.title || 'Tour'} - ${['paid', 'succeeded', 'completed'].includes(booking.payment_status.toLowerCase()) ? 'Full Payment' : 'Payment'}`,
      date: booking.created_at,
      method: booking.stripe_payment_intent_id ? 'Card Payment' : 'Payment',
      amount: booking.total_price,
      currency: booking.currency,
      status: ['paid', 'succeeded', 'completed'].includes(booking.payment_status.toLowerCase()) ? 'completed' : booking.payment_status.toLowerCase(),
      bookingRef: booking.booking_reference || booking.id.slice(0, 8)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Transform bookings into receipts (only for paid bookings)
  const receipts = bookings
    .filter(b => {
      const paymentStatus = b.payment_status.toLowerCase();
      return paymentStatus === 'paid' || paymentStatus === 'completed' || paymentStatus === 'succeeded';
    })
    .map(booking => ({
      id: booking.id,
      title: `${booking.tours?.title || 'Tour'} - Receipt`,
      date: booking.created_at,
      bookingRef: booking.booking_reference || booking.id.slice(0, 8),
      amount: booking.total_price,
      currency: booking.currency
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatBookingDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmed') return 'default';
    if (statusLower === 'pending') return 'secondary';
    if (statusLower === 'completed') return 'outline';
    return 'destructive';
  };

  const getPaymentStatusBadge = (booking: any) => {
    const statusLower = booking.payment_status.toLowerCase();
    
    // Check if this is a deposit payment with automatic final payment scheduled
    if (booking.payment_type === 'deposit') {
      if (['paid', 'succeeded', 'completed'].includes(statusLower)) {
        // Deposit has been paid
        if (booking.final_payment_status === 'pending' && booking.final_payment_due_date) {
          return { variant: 'default' as const, label: 'Deposit Paid' };
        } else if (booking.final_payment_status === 'succeeded') {
          return { variant: 'default' as const, label: 'Paid in Full' };
        }
        return { variant: 'default' as const, label: 'Deposit Paid' };
      } else if (statusLower === 'pending') {
        return { variant: 'secondary' as const, label: 'Deposit Pending' };
      }
    }
    
    // Full payment handling
    if (statusLower === 'paid' || statusLower === 'succeeded' || statusLower === 'completed') {
      return { variant: 'default' as const, label: 'Paid in Full' };
    }
    if (statusLower === 'pending') {
      return { variant: 'secondary' as const, label: 'Payment Pending' };
    }
    return { variant: 'outline' as const, label: booking.payment_status };
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair text-charcoal mb-2">Bookings & Payments</h1>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-burgundy/10">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair text-charcoal mb-2">Bookings & Payments</h1>
        </div>
        <Card className="border-burgundy/10">
          <CardContent className="p-6 text-center">
            <p className="text-charcoal/60">Failed to load bookings. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair text-charcoal mb-2">Bookings & Payments</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-cream border border-burgundy/10">
          <TabsTrigger value="active" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Active Bookings
            {activeBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-burgundy/10 text-burgundy border-burgundy/20">{activeBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">Payment History</TabsTrigger>
          <TabsTrigger value="receipts" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">Receipts</TabsTrigger>
        </TabsList>

        {/* Active Bookings */}
        <TabsContent value="active" className="space-y-4">
          {activeBookings.length === 0 ? (
            <Card className="border-burgundy/10">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-burgundy/40" />
                <h3 className="text-xl font-playfair text-charcoal mb-2">No Active Bookings</h3>
                <p className="text-charcoal/60 mb-4">
                  You don't have any upcoming hiking adventures yet.
                </p>
                <Button onClick={() => window.location.href = '/tours'} className="bg-burgundy hover:bg-burgundy-dark text-white">
                  Browse Tours
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeBookings.map((booking) => {
              const tour = booking.tours;
              const guide = tour?.guide_profiles;
              const paymentBadge = getPaymentStatusBadge(booking);
              
              return (
              <Card key={booking.id} className="border-burgundy/10 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-sage/20 text-sage border-sage/30 hover:bg-sage/30">
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-charcoal/60">
                          Booking ID: {booking.booking_reference || booking.id.slice(0, 8)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-playfair text-charcoal mb-2">{tour?.title || 'Tour'}</h3>
                      <p className="text-charcoal/70">
                        {formatBookingDate(booking.booking_date)}
                        {tour?.duration && ` • ${tour.duration}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-playfair font-bold text-burgundy">
                        {getCurrencySymbol(booking.currency)}{booking.total_price}
                      </div>
                      <Badge className="mt-2 bg-sage/20 text-sage border-sage/30">
                        {paymentBadge.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-6 py-4 border-y border-burgundy/10 bg-cream/30 rounded-lg px-4">
                    <div>
                      <p className="text-sm text-charcoal/60 mb-1">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-burgundy" />
                        <span className="font-medium text-charcoal">{tour?.meeting_point || 'TBD'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-charcoal/60 mb-1">Guide</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal">{guide?.display_name || 'Guide'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-charcoal/60 mb-1">Guests</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-burgundy" />
                        <span className="font-medium text-charcoal">{booking.participants} {booking.participants === 1 ? 'Guest' : 'Guests'}</span>
                      </div>
                    </div>
                  </div>

                  {booking.payment_type === 'deposit' && (
                    <>
                      {(!booking.final_payment_status || booking.final_payment_status === 'pending') && booking.final_payment_due_date && booking.final_payment_amount && (
                        <div className="bg-sage/10 border border-sage/20 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-sage mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-charcoal mb-2">Final Payment Scheduled</p>
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-charcoal/60 mb-1">Deposit Paid</p>
                                  <p className="text-sm font-medium text-charcoal">
                                    {getCurrencySymbol(booking.currency)}{booking.deposit_amount?.toFixed(2) || (booking.total_price - (booking.final_payment_amount || 0)).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-charcoal/60 mb-1">Final Payment Due</p>
                                  <p className="text-sm font-medium text-charcoal">
                                    {getCurrencySymbol(booking.currency)}{booking.final_payment_amount.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-white rounded-md p-3 border border-sage/20">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium text-charcoal">Auto-charge date:</p>
                                  <p className="text-sm font-semibold text-sage">{formatBookingDate(booking.final_payment_due_date)}</p>
                                </div>
                                <p className="text-xs text-charcoal/60">
                                  The final payment will be automatically charged to your saved payment method on this date.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {booking.final_payment_status === 'requires_action' && (
                        <div className="bg-burgundy/5 border border-burgundy/20 rounded-lg p-4 mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-burgundy mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-charcoal">Payment Action Required</p>
                                <p className="text-sm text-charcoal/70 mt-1">
                                  We couldn't automatically charge your payment method. Please complete the payment manually.
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => onViewBooking(booking.id)}
                              className="bg-burgundy hover:bg-burgundy-dark text-white"
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {booking.payment_status.toLowerCase() === 'pending' && booking.payment_type !== 'deposit' && !booking.stripe_payment_intent_id && (
                    <div className="bg-burgundy/5 border border-burgundy/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-playfair font-semibold text-charcoal mb-1">Payment Pending</h4>
                          <p className="text-sm text-charcoal/70">
                            Complete your payment to confirm your booking
                          </p>
                        </div>
                        <Button className="bg-burgundy hover:bg-burgundy-dark text-white" onClick={() => onViewBooking(booking.id)}>Pay Now</Button>
                      </div>
                    </div>
                  )}

                  {booking.special_requests && (
                    <div className="bg-cream/50 border border-burgundy/10 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-charcoal mb-1">Special Requests</p>
                      <p className="text-sm text-charcoal/70">{booking.special_requests}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => onViewBooking(booking.id)} className="border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-white">
                      <Download className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedReceipt(booking.id)}
                      disabled={!['paid', 'succeeded', 'completed'].includes(booking.payment_status.toLowerCase())}
                      className="border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-white disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                    <Button variant="outline" onClick={() => tour?.guide_id && onContactGuide(tour.guide_id)} className="border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-white">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
          )}
        </TabsContent>

        {/* Payment History */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button variant="outline" className="border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {paymentHistory.length === 0 ? (
            <Card className="border-burgundy/10">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-burgundy/40" />
                <h3 className="text-xl font-playfair text-charcoal mb-2">No Payment History</h3>
                <p className="text-charcoal/60">
                  Your payment transactions will appear here once you make bookings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <Card key={payment.id} className="border-burgundy/10 bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-full ${
                          payment.status === 'completed' ? 'bg-sage/20' : 'bg-burgundy/10'
                        }`}>
                          <CheckCircle2 className={`w-5 h-5 ${
                            payment.status === 'completed' ? 'text-sage' : 'text-burgundy'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal">{payment.description}</h4>
                          <p className="text-sm text-charcoal/60">
                            {formatBookingDate(payment.date)} • {payment.method}
                            {payment.bookingRef && ` • Ref: ${payment.bookingRef}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-playfair font-bold text-burgundy">
                          {getCurrencySymbol(payment.currency)}{payment.amount}
                        </div>
                        <div className="text-sm text-charcoal/60 capitalize">
                          {payment.status}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Receipts */}
        <TabsContent value="receipts" className="space-y-4">
          <h2 className="text-2xl font-playfair text-charcoal mb-4">Receipts & Invoices</h2>

          {receipts.length === 0 ? (
            <Card className="border-burgundy/10">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-burgundy/40" />
                <h3 className="text-xl font-playfair text-charcoal mb-2">No Receipts Available</h3>
                <p className="text-charcoal/60">
                  Receipts will be available after you complete payments for your bookings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <Card key={receipt.id} className="border-burgundy/10 bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-burgundy/10 rounded-lg">
                          <FileText className="w-6 h-6 text-burgundy" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal">{receipt.title}</h4>
                          <p className="text-sm text-charcoal/60">
                            {formatBookingDate(receipt.date)} • {receipt.bookingRef}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-playfair font-bold text-burgundy">
                          {getCurrencySymbol(receipt.currency)}{receipt.amount}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedReceipt(receipt.id)}
                          className="border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Receipt Viewer Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedReceipt && (
            <ReceiptViewer 
              bookingId={selectedReceipt} 
              onClose={() => setSelectedReceipt(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
