import { useState } from 'react';
import { format } from 'date-fns';
import {
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
import { MessagesModal } from './MessagesModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { BookingWithDetails, Message } from '@/types';

interface BookingDetailViewProps {
  booking: BookingWithDetails;
  onStatusChange?: () => void;
}

export function BookingDetailView({ booking, onStatusChange }: BookingDetailViewProps) {
  const { toast } = useToast();
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messages] = useState<Message[]>([
    {
      id: '1',
      booking_id: booking.id,
      sender: 'guest',
      content: "Hi! I'm really excited about this tour. Do we need to bring our own crampons?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: '2',
      booking_id: booking.id,
      sender: 'guide',
      content: "Hello! Yes, please bring your own crampons and ice axe. We'll provide harnesses and helmets. Looking forward to the adventure!",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: true,
    },
  ]);

  const handleAcceptBooking = async () => {
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
      
      onStatusChange?.();
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
      
      onStatusChange?.();
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

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-playfair text-charcoal mb-1">
            Booking #{booking.booking_reference || booking.id.slice(0, 12).toUpperCase()}
          </h2>
          <p className="text-charcoal/60">
            {booking.tour?.title} • {format(new Date(booking.booking_date), 'MMMM dd, yyyy')}
          </p>
        </div>
        <Badge className={getStatusBadgeClass(booking.status)}>
          {booking.status}
        </Badge>
      </div>

      {/* 3-Column Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Guest Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-playfair text-charcoal">Guest Information</h3>

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
            {booking.guest?.phone && (
              <a
                href={`tel:${booking.guest?.phone}`}
                className="flex items-center gap-2 text-burgundy hover:underline"
              >
                <Phone className="w-4 h-4" />
                {booking.guest?.phone}
              </a>
            )}
          </div>

          <Separator />

          {/* All Participants */}
          <div>
            <h4 className="text-sm font-medium text-charcoal mb-2">
              All Participants ({booking.participants})
            </h4>
            {booking.participants_details?.map((participant, idx) => (
              <div key={idx} className="bg-cream/70 p-3 rounded-lg mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-charcoal">
                      {(participant as any).firstName && (participant as any).surname
                        ? `${(participant as any).firstName} ${(participant as any).surname}`
                        : participant.name}
                    </p>
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
            <h4 className="text-sm font-medium text-charcoal mb-2">Special Requests</h4>
            {booking.special_requests ? (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-charcoal">{booking.special_requests}</p>
              </div>
            ) : (
              <p className="text-sm text-charcoal/60">No special requests</p>
            )}
          </div>
        </Card>

        {/* Center Column - Tour Details */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-playfair text-charcoal">Tour Details</h3>

          <div>
            <h4 className="text-xl font-playfair text-charcoal">{booking.tour?.title}</h4>
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
                  {booking.tour?.meeting_point || 'Location TBD'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div>
            <h4 className="text-sm font-medium text-charcoal mb-2">Payment</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Subtotal:</span>
                <span className="font-medium">€{booking.subtotal || booking.total_price}</span>
              </div>
              {booking.service_fee_amount && (
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Service Fee:</span>
                  <span className="font-medium">€{booking.service_fee_amount}</span>
                </div>
              )}
              {booking.discount_amount && booking.discount_amount > 0 && (
                <div className="flex justify-between text-sage">
                  <span>Discount:</span>
                  <span className="font-medium">-€{booking.discount_amount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-medium">Total:</span>
                <span className="font-bold">€{booking.total_price}</span>
              </div>
              <Badge className={booking.payment_status === 'succeeded' ? 'bg-sage/10 text-sage' : 'bg-gold/10 text-gold'}>
                Payment: {booking.payment_status || 'pending'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Right Column - Actions */}
        <Card className="p-6 space-y-3">
          <h3 className="text-lg font-playfair text-charcoal mb-4">Actions</h3>

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

          {/* Messages Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-charcoal">Messages</h4>
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
