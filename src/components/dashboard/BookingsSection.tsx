import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { BookingWithDetails } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useGuideBookingsByTour } from '@/hooks/useGuideBookingsByTour';
import { TourBookingsList } from './TourBookingsList';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'status' | 'tour'>('status');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  
  // Fetch tour bookings
  const { tours, loading: toursLoading } = useGuideBookingsByTour(user?.id);

  const handleBookingClick = (booking: BookingWithDetails) => {
    navigate(`/dashboard/bookings/${booking.id}`);
    onBookingClick?.(booking);
  };

  const counts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending' || b.status === 'pending_confirmation').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
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
        return 'bg-sage/10 text-sage border-sage/20';
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
            Bookings
          </h1>
          <p className="text-charcoal/60">
            Manage your tour bookings and guest communications
          </p>
        </div>
        <Button variant="outline" onClick={onExport} className="border-burgundy/20 text-burgundy hover:bg-burgundy/10">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode === 'tour' ? 'tour' : activeTab} onValueChange={(value) => {
        if (value === 'tour') {
          setViewMode('tour');
        } else {
          setViewMode('status');
          setActiveTab(value as any);
        }
      }}>
        <TabsList className="bg-cream p-1 rounded-lg mb-6">
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
          <TabsTrigger 
            value="tour" 
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            By Tour ({tours.length})
          </TabsTrigger>
        </TabsList>

        {/* Status View */}
        <TabsContent value="all">
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center border-burgundy/10">
              <Users className="w-16 h-16 text-charcoal/40 mx-auto mb-4" />
              <h3 className="text-lg font-playfair text-charcoal mb-2">
                No bookings yet
              </h3>
              <p className="text-sm text-charcoal/60">
                Bookings will appear here once guests start booking your tours
              </p>
            </Card>
          ) : (
            <Card className="overflow-x-auto border-burgundy/10">
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
                <TableBody className="divide-y divide-burgundy/10">
                  {filteredBookings.map((booking) => (
                    <TableRow 
                      key={booking.id}
                      className="hover:bg-cream/30 transition-colors cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <TableCell className="px-6 py-4 text-charcoal">
                        {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-charcoal">
                        {booking.tour?.title || 'Unknown Tour'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-charcoal">
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
        </TabsContent>
        <TabsContent value="pending">
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center border-burgundy/10">
              <Users className="w-16 h-16 text-charcoal/40 mx-auto mb-4" />
              <h3 className="text-lg font-playfair text-charcoal mb-2">
                No pending bookings
              </h3>
              <p className="text-sm text-charcoal/60">
                Pending bookings will appear here
              </p>
            </Card>
          ) : (
            <Card className="overflow-x-auto border-burgundy/10">
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
                <TableBody className="divide-y divide-burgundy/10">
                  {filteredBookings.map((booking) => (
                    <TableRow 
                      key={booking.id}
                      className="hover:bg-cream/30 transition-colors cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <TableCell className="px-6 py-4 text-charcoal">
                        {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-charcoal">
                        {booking.tour?.title || 'Unknown Tour'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-charcoal">
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
        </TabsContent>
        <TabsContent value="confirmed">
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center border-burgundy/10">
              <Users className="w-16 h-16 text-charcoal/40 mx-auto mb-4" />
              <h3 className="text-lg font-playfair text-charcoal mb-2">
                No confirmed bookings
              </h3>
              <p className="text-sm text-charcoal/60">
                Confirmed bookings will appear here
              </p>
            </Card>
          ) : (
            <Card className="overflow-x-auto border-burgundy/10">
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
                <TableBody className="divide-y divide-burgundy/10">
                  {filteredBookings.map((booking) => (
                    <TableRow 
                      key={booking.id}
                      className="hover:bg-cream/30 transition-colors cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <TableCell className="px-6 py-4 text-charcoal">
                        {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-charcoal">
                        {booking.tour?.title || 'Unknown Tour'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-charcoal">
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
        </TabsContent>
        <TabsContent value="completed">
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center border-burgundy/10">
              <Users className="w-16 h-16 text-charcoal/40 mx-auto mb-4" />
              <h3 className="text-lg font-playfair text-charcoal mb-2">
                No completed bookings
              </h3>
              <p className="text-sm text-charcoal/60">
                Completed bookings will appear here
              </p>
            </Card>
          ) : (
            <Card className="overflow-x-auto border-burgundy/10">
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
                <TableBody className="divide-y divide-burgundy/10">
                  {filteredBookings.map((booking) => (
                    <TableRow 
                      key={booking.id}
                      className="hover:bg-cream/30 transition-colors cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <TableCell className="px-6 py-4 text-charcoal">
                        {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-charcoal">
                        {booking.tour?.title || 'Unknown Tour'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-charcoal">
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
        </TabsContent>

        {/* Tour View */}
        <TabsContent value="tour">
          <TourBookingsList tours={tours} loading={toursLoading} />
        </TabsContent>
      </Tabs>

    </div>
  );
}
