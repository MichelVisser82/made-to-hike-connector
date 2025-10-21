import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Eye, Download, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { BookingDetailView } from './BookingDetailView';
import type { BookingWithDetails } from '@/types';

interface BookingsSectionProps {
  bookings: BookingWithDetails[];
  loading: boolean;
  onBookingClick?: (booking: BookingWithDetails) => void;
  onExport: () => void;
  onBookingsChange?: () => void;
}

export function BookingsSection({
  bookings,
  loading,
  onBookingClick,
  onExport,
  onBookingsChange,
}: BookingsSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleBookingClick = async (booking: BookingWithDetails) => {
    // Fetch fresh booking data
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tours!inner(title, duration, region, meeting_point, guide_id),
        profiles!bookings_hiker_id_fkey(id, name, email, avatar_url)
      `)
      .eq('id', booking.id)
      .single();

    if (!error && data) {
      const transformedBooking: BookingWithDetails = {
        ...data,
        status: data.status as any,
        payment_status: data.payment_status as any,
        tour: data.tours as any,
        guest: data.profiles as any,
        participants_details: data.participants_details as any,
      };
      setSelectedBooking(transformedBooking);
      setSheetOpen(true);
    }
    
    // Also call the optional external handler
    onBookingClick?.(booking);
  };

  const handleStatusChange = () => {
    setSheetOpen(false);
    setSelectedBooking(null);
    onBookingsChange?.();
  };

  const counts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending' || b.status === 'pending_confirmation').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }), [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return bookings;
    if (activeTab === 'pending') {
      return bookings.filter(b => b.status === 'pending' || b.status === 'pending_confirmation');
    }
    return bookings.filter(b => b.status === activeTab);
  }, [bookings, activeTab]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_confirmation':
        return 'bg-gold/10 text-gold border-gold/20';
      case 'confirmed':
        return 'bg-sage/10 text-sage border-sage/20';
      case 'completed':
        return 'bg-burgundy/10 text-burgundy border-burgundy/20';
      case 'cancelled':
        return 'bg-charcoal/10 text-charcoal border-charcoal/20';
      default:
        return 'bg-charcoal/10 text-charcoal border-charcoal/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-playfair text-charcoal mb-2">
            Bookings & Guests
          </h1>
          <p className="text-charcoal/60">
            Manage your tour bookings and guest communications
          </p>
        </div>
        <Button variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="bg-cream p-1 rounded-lg">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            All Bookings ({counts.all})
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger 
            value="confirmed" 
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Confirmed ({counts.confirmed})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Completed ({counts.completed})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table Card */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
          <h3 className="text-lg font-playfair text-charcoal mb-2">
            No bookings yet
          </h3>
          <p className="text-sm text-charcoal/60">
            Bookings will appear here once guests start booking your tours
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-cream/70 border-b border-burgundy/10">
                <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                  Date
                </TableHead>
                <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                  Tour
                </TableHead>
                <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                  Guest
                </TableHead>
                <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                  Participants
                </TableHead>
                <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-burgundy/5">
              {filteredBookings.map((booking) => (
                <TableRow 
                  key={booking.id}
                  className="hover:bg-cream/30 transition-colors cursor-pointer"
                  onClick={() => handleBookingClick(booking)}
                >
                  <TableCell className="px-6 py-4">
                    {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-charcoal">
                    {booking.tour?.title || 'Unknown Tour'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {booking.guest?.name || 'Unknown Guest'}
                  </TableCell>
                  <TableCell className="px-6 py-4">{booking.participants}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium">
                    €{booking.total_price}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookingClick(booking);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Booking Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-full lg:max-w-[90vw] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-playfair">Booking Details</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSheetOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          
          {selectedBooking && (
            <BookingDetailView 
              booking={selectedBooking} 
              onStatusChange={handleStatusChange}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
