import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Check,
  X,
  AlertCircle,
  Star,
  MessageSquare,
  Cloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MessagesModal } from './MessagesModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { BookingWithDetails, Message } from '@/types';

export function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messages] = useState<Message[]>([
    {
      id: '1',
      booking_id: bookingId || '',
      sender: 'guest',
      content: "Hi! I'm really excited about this tour. Do we need to bring our own crampons?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: '2',
      booking_id: bookingId || '',
      sender: 'guide',
      content: "Hello! Yes, please bring your own crampons and ice axe. We'll provide harnesses and helmets. Looking forward to the adventure!",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: true,
    },
  ]);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours!inner(title, duration, region, meeting_point, guide_id),
          profiles!bookings_hiker_id_fkey(id, name, email, avatar_url)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;

      // Transform and add mock data
      const transformedBooking: BookingWithDetails = {
        ...data,
        status: data.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'pending_confirmation',
        payment_status: data.payment_status as 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | null | undefined,
        tour: data.tours as any,
        guest: {
          ...data.profiles,
          phone: '+33 6 12 34 56 78',
        },
        participants_details: (data.participants_details as any) || Array.from({ length: data.participants }, (_, i) => ({
          name: i === 0 ? data.profiles.name : `Guest ${i + 1}`,
          age: 32 + i,
          waiver_signed: i < data.participants - 1,
        })),
        emergency_contact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '+33 6 98 76 54 32',
        },
      };

      setBooking(transformedBooking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to load booking details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async () => {
    if (!booking) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Booking Confirmed',
        description: 'The booking has been confirmed successfully.',
      });
      
      // Refresh booking data
      fetchBooking();
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm booking',
        variant: 'destructive',
      });
    }
  };

  const handleDeclineBooking = async () => {
    if (!booking) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Booking Declined',
        description: 'The booking has been cancelled.',
      });
      
      navigate('/dashboard?section=bookings');
    } catch (error) {
      console.error('Error declining booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline booking',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_confirmation':
        return 'bg-gold/10 text-gold border-gold/20 text-base px-4 py-2';
      case 'confirmed':
        return 'bg-sage/10 text-sage border-sage/20 text-base px-4 py-2';
      case 'completed':
        return 'bg-burgundy/10 text-burgundy border-burgundy/20 text-base px-4 py-2';
      case 'cancelled':
        return 'bg-charcoal/10 text-charcoal border-charcoal/20 text-base px-4 py-2';
      default:
        return 'bg-charcoal/10 text-charcoal border-charcoal/20 text-base px-4 py-2';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-playfair text-charcoal mb-2">Booking not found</h2>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-charcoal/60 hover:text-burgundy mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Bookings
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-playfair text-charcoal mb-1">
              Booking #{booking.id.slice(0, 12).toUpperCase()}
            </h1>
            <p className="text-charcoal/60">
              {booking.tour?.title} • {format(new Date(booking.booking_date), 'MMMM dd, yyyy')}
            </p>
          </div>
          <Badge className={getStatusBadgeClass(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Guest Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-playfair text-charcoal">Guest Information</h2>

          {/* Avatar & Name */}
          <div className="flex gap-3">
            <Avatar className="w-12 h-12 bg-gradient-to-br from-burgundy to-burgundy-dark text-white text-lg">
              <AvatarFallback className="bg-gradient-to-br from-burgundy to-burgundy-dark text-white">
                {getInitials(booking.guest?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-charcoal">{booking.guest?.name}</p>
              <p className="text-sm text-charcoal/60">Primary Guest</p>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <a
              href={`mailto:${booking.guest?.email}`}
              className="flex items-center gap-2 text-burgundy hover:underline"
            >
              <Mail className="w-4 h-4" />
              {booking.guest?.email}
            </a>
            <a
              href={`tel:${booking.guest?.phone}`}
              className="flex items-center gap-2 text-burgundy hover:underline"
            >
              <Phone className="w-4 h-4" />
              {booking.guest?.phone}
            </a>
          </div>

          <Separator />

          {/* All Participants */}
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-2">
              All Participants ({booking.participants})
            </h3>
            {booking.participants_details?.map((participant, idx) => (
              <div key={idx} className="bg-cream/70 p-3 rounded-lg mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-charcoal">{participant.name}</p>
                    <p className="text-sm text-charcoal/60">Age: {participant.age}</p>
                  </div>
                  {participant.waiver_signed ? (
                    <Check className="w-4 h-4 text-sage" />
                  ) : (
                    <Clock className="w-4 h-4 text-gold" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Special Requests */}
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-2">Special Requests</h3>
            {booking.special_requests ? (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-charcoal">{booking.special_requests}</p>
              </div>
            ) : (
              <p className="text-sm text-charcoal/60">No special requests</p>
            )}
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-2">Emergency Contact</h3>
            {booking.emergency_contact && (
              <div className="space-y-1">
                <p className="font-medium text-charcoal">{booking.emergency_contact.name}</p>
                <p className="text-sm text-charcoal/60">{booking.emergency_contact.relationship}</p>
                <a
                  href={`tel:${booking.emergency_contact.phone}`}
                  className="text-sm text-burgundy hover:underline"
                >
                  {booking.emergency_contact.phone}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Center Column - Tour Details */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-playfair text-charcoal">Tour Details</h2>

          <div>
            <h3 className="text-xl font-playfair text-charcoal">{booking.tour?.title}</h3>
            <Badge variant="outline" className="mt-2">{booking.tour?.duration}</Badge>
          </div>

          <Separator />

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-cream/50 p-3 rounded">
              <Calendar className="w-4 h-4 text-burgundy mb-1" />
              <p className="text-xs text-charcoal/60">Date</p>
              <p className="text-sm font-medium text-charcoal">
                {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="bg-cream/50 p-3 rounded">
              <Clock className="w-4 h-4 text-burgundy mb-1" />
              <p className="text-xs text-charcoal/60">Time</p>
              <p className="text-sm font-medium text-charcoal">8:00 AM</p>
            </div>
          </div>

          <Separator />

          {/* Meeting Location */}
          <div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-charcoal">Meeting Location</p>
                <p className="text-sm text-charcoal/60 mt-1">
                  {booking.tour?.meeting_point || 'Chamonix Valley Car Park'}
                </p>
                <button className="text-sm text-burgundy mt-1 hover:underline">
                  View on Map
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Equipment Checklist */}
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-2">Equipment Checklist</h3>
            <div className="space-y-2">
              {['Mountaineering boots', 'Crampons & ice axe', 'Harness & helmet', 'Warm layers', 'Water & snacks'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Checkbox checked disabled />
                  <span className="text-sm text-charcoal">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Weather Forecast */}
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-2">Weather Forecast</h3>
            <div className="flex items-center gap-2">
              <Cloud className="w-8 h-8 text-charcoal/40" />
              <div>
                <p className="text-sm font-medium text-charcoal">Sunny</p>
                <p className="text-xs text-charcoal/60">15°C • High: 18°C • Low: 10°C</p>
                <p className="text-xs text-sage mt-1">Perfect conditions for hiking</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Waiver Status */}
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-2">Waiver Status</h3>
            {booking.participants_details?.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-sm text-charcoal">{p.name}</span>
                <Badge className={p.waiver_signed ? 'bg-sage/10 text-sage' : 'bg-gold/10 text-gold'}>
                  {p.waiver_signed ? 'Signed' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column - Actions */}
        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-playfair text-charcoal mb-4">Actions</h2>

          {/* Conditional Buttons Based on Status */}
          {(booking.status === 'pending' || booking.status === 'pending_confirmation') && (
            <>
              <Button 
                className="w-full bg-sage hover:bg-sage/90 text-white"
                onClick={handleAcceptBooking}
              >
                <Check className="w-4 h-4 mr-2" />
                Accept Booking
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button variant="outline" className="w-full">
                Counter-offer
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDeclineBooking}
              >
                <X className="w-4 h-4 mr-2" />
                Decline Booking
              </Button>
            </>
          )}

          {booking.status === 'confirmed' && (
            <>
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button variant="destructive" className="w-full">
                <X className="w-4 h-4 mr-2" />
                Cancel Booking
              </Button>
            </>
          )}

          {booking.status === 'completed' && (
            <>
              <Button variant="outline" className="w-full">
                <Star className="w-4 h-4 mr-2" />
                View Review
              </Button>
              <Button variant="outline" className="w-full">
                Request Review
              </Button>
            </>
          )}

          <Separator />

          {/* Emergency Section */}
          <div>
            <h3 className="text-sm text-destructive font-medium mb-2">Emergency Contact</h3>
            {booking.emergency_contact && (
              <>
                <p className="text-sm text-charcoal mb-1">{booking.emergency_contact.name}</p>
                <p className="text-sm text-charcoal/60 mb-2">{booking.emergency_contact.phone}</p>
                <Button variant="destructive" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Emergency Number
                </Button>
              </>
            )}
          </div>

          <Separator />

          {/* Messages Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-charcoal">Messages</h3>
              <Badge variant="destructive">{messages.length}</Badge>
            </div>
            <Button
              className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
              onClick={() => setMessagesOpen(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              View Messages ({messages.length})
            </Button>
            <p className="text-xs text-charcoal/50 text-center mt-2">
              Last message: 1 hour ago
            </p>
          </div>
        </Card>
      </div>

      {/* Messages Modal */}
      <MessagesModal
        isOpen={messagesOpen}
        onClose={() => setMessagesOpen(false)}
        booking={booking}
      />
    </div>
  );
}
