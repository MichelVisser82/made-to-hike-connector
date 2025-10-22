import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Users, Download, FileText, MessageSquare, CheckCircle2, Calendar } from 'lucide-react';
import { useHikerBookings } from '@/hooks/useHikerBookings';
import { format } from 'date-fns';

interface HikerBookingsSectionProps {
  userId: string;
  onViewBooking: (bookingId: string) => void;
  onContactGuide: (guideId: string) => void;
}

export function HikerBookingsSection({ userId, onViewBooking, onContactGuide }: HikerBookingsSectionProps) {
  const [activeTab, setActiveTab] = useState('active');
  const { bookings, loading, error } = useHikerBookings(userId);

  // Filter bookings by status
  const activeBookings = bookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status.toLowerCase())
  );

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
    {
      id: '2',
      bookingRef: 'MTH-2025-10892',
      title: 'Scottish Highlands Adventure',
      dates: 'November 2-4, 2025',
      location: 'Glen Coe, Scotland',
      guide: 'James MacDonald',
      guideId: 'guide2',
      guests: 2,
      amount: 650,
      status: 'confirmed',
      paymentStatus: 'partially_paid',
      remaining: 325,
      dueDate: 'October 25, 2025'
    }
  ];

  const paymentHistory = [
    {
      id: '1',
      description: 'Final payment - Scottish Highlands Adventure',
      date: 'October 1, 2025',
      method: 'Visa ****1234',
      amount: 325,
      status: 'completed'
    },
    {
      id: '2',
      description: 'Full payment - Mont Blanc Summit Trek',
      date: 'September 15, 2025',
      method: 'Mastercard ****5678',
      amount: 890,
      status: 'completed'
    },
    {
      id: '3',
      description: 'Deposit - Scottish Highlands Adventure',
      date: 'September 1, 2025',
      method: 'Visa ****1234',
      amount: 325,
      status: 'completed'
    },
    {
      id: '4',
      description: 'Full payment - Dolomites Via Ferrata',
      date: 'August 20, 2024',
      method: 'Visa ****1234',
      amount: 720,
      status: 'completed'
    }
  ];

  const receipts = [
    {
      id: '1',
      title: 'Scottish Highlands Adventure - Final Payment',
      date: 'October 1, 2025',
      bookingRef: 'MTH-2025-10892',
      amount: 325
    },
    {
      id: '2',
      title: 'Mont Blanc Summit Trek',
      date: 'September 15, 2025',
      bookingRef: 'MTH-2025-10847',
      amount: 890
    },
    {
      id: '3',
      title: 'Scottish Highlands Adventure - Deposit',
      date: 'September 1, 2025',
      bookingRef: 'MTH-2025-10892',
      amount: 325
    }
  ];

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

  const getPaymentStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'paid') return { variant: 'default' as const, label: 'Paid in Full' };
    if (statusLower === 'pending') return { variant: 'secondary' as const, label: 'Payment Pending' };
    return { variant: 'outline' as const, label: status };
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
          <h1 className="text-3xl font-serif mb-2">Bookings & Payments</h1>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
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
          <h1 className="text-3xl font-serif mb-2">Bookings & Payments</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load bookings. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif mb-2">Bookings & Payments</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active Bookings
            {activeBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        {/* Active Bookings */}
        <TabsContent value="active" className="space-y-4">
          {activeBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Active Bookings</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any upcoming hiking adventures yet.
                </p>
                <Button onClick={() => window.location.href = '/tours'}>
                  Browse Tours
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeBookings.map((booking) => {
              const tour = booking.tours;
              const guide = tour?.guide_profiles;
              const paymentBadge = getPaymentStatusBadge(booking.payment_status);
              
              return (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Booking ID: {booking.booking_reference || booking.id.slice(0, 8)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-semibold mb-2">{tour?.title || 'Tour'}</h3>
                      <p className="text-muted-foreground">
                        {formatBookingDate(booking.booking_date)}
                        {tour?.duration && ` • ${tour.duration}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {getCurrencySymbol(booking.currency)}{booking.total_price}
                      </div>
                      <Badge variant={paymentBadge.variant} className="mt-2">
                        {paymentBadge.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-6 py-4 border-y">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{tour?.meeting_point || 'TBD'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Guide</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{guide?.display_name || 'Guide'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Guests</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{booking.participants} {booking.participants === 1 ? 'Guest' : 'Guests'}</span>
                      </div>
                    </div>
                  </div>

                  {booking.payment_status.toLowerCase() === 'pending' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold mb-1">Payment Pending</h4>
                          <p className="text-sm text-muted-foreground">
                            Complete your payment to confirm your booking
                          </p>
                        </div>
                        <Button variant="default">Pay Now</Button>
                      </div>
                    </div>
                  )}

                  {booking.special_requests && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium mb-1">Special Requests</p>
                      <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => onViewBooking(booking.id)}>
                      👁️ View Details
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                    <Button variant="outline" onClick={() => tour?.guide_id && onContactGuide(tour.guide_id)}>
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
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{payment.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          {payment.date} • {payment.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">€{payment.amount}</div>
                      <div className="text-sm text-muted-foreground">{payment.status}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Receipts */}
        <TabsContent value="receipts" className="space-y-4">
          <h2 className="text-2xl font-serif mb-4">Receipts & Invoices</h2>

          <div className="space-y-3">
            {receipts.map((receipt) => (
              <Card key={receipt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{receipt.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {receipt.date} • {receipt.bookingRef}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold">€{receipt.amount}</div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
