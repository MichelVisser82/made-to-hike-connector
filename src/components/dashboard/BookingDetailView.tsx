import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessagesModal } from "./MessagesModal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  Calendar,
  DollarSign,
  MessageSquare,
  PhoneCall,
  AlertCircle,
  CloudSun,
} from "lucide-react";

interface BookingWithDetails {
  id: string;
  booking_reference: string;
  booking_date: string;
  status: string;
  participants: number;
  total_price: number;
  currency: string;
  special_requests: string | null;
  participants_details: any;
  refund_amount?: number;
  refund_status?: string;
  refunded_at?: string;
  stripe_refund_id?: string;
  refund_reason?: string;
  tour: {
    id: string;
    title: string;
    duration: string;
    meeting_point: string;
    includes: string[];
  };
  hiker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
  };
}

export function BookingDetailView() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

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
          tour:tours(id, title, duration, meeting_point, includes),
          hiker:profiles!bookings_hiker_id_fkey(id, name, email, phone, avatar_url)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data as BookingWithDetails);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking has been confirmed",
      });
      
      fetchBooking();
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast({
        title: "Error",
        description: "Failed to confirm booking",
        variant: "destructive",
      });
    }
  };

  const handleDeclineBooking = async () => {
    try {
      setLoading(true);
      setShowDeclineDialog(false);

      // Call refund edge function
      const { data: refundData, error: refundError } = await supabase.functions.invoke('process-refund', {
        body: {
          booking_id: bookingId,
          reason: 'Booking declined by guide',
        }
      });

      if (refundError) {
        console.error('Refund error:', refundError);
        throw new Error(refundError.message || 'Failed to process refund');
      }

      toast({
        title: "Success",
        description: refundData.message || "Booking declined and refund processed. The hiker will be notified via email.",
      });
      
      navigate('/dashboard?section=bookings');
    } catch (error: any) {
      console.error('Error declining booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline booking and process refund. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-sage text-white hover:bg-sage/90';
      case 'pending':
      case 'pending_confirmation':
        return 'bg-gold/10 text-gold border-gold/20';
      case 'completed':
        return 'bg-primary text-white hover:bg-primary/90';
      case 'cancelled':
        return 'bg-burgundy text-white hover:bg-burgundy/90';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Booking not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const participants = Array.isArray(booking.participants_details) 
    ? booking.participants_details 
    : [];

  const emergencyContact = participants[0] ? {
    name: `${participants[0].emergencyContactName || 'Not provided'}`,
    relationship: participants[0].emergencyContactRelationship || 'Not provided',
    phone: participants[0].emergencyContactPhone || 'Not provided'
  } : null;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard?section=bookings">Bookings</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Booking Detail</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>#{booking.booking_reference}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard?section=bookings')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-playfair text-charcoal">
              Booking #{booking.booking_reference}
            </h1>
            <p className="text-charcoal/60 mt-1">
              {booking.tour.title} • {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <Badge className={getStatusBadgeClass(booking.status)}>
          {booking.status === 'pending_confirmation' ? 'Confirmed' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Guest Information */}
        <Card className="bg-cream/30">
          <CardHeader>
            <CardTitle className="text-lg font-playfair">Guest Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Guest */}
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={booking.hiker.avatar_url || undefined} />
                <AvatarFallback className="bg-burgundy text-white">
                  {getInitials(booking.hiker.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-charcoal">{booking.hiker.name}</p>
                <p className="text-sm text-charcoal/60">Primary Guest</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <a
                href={`mailto:${booking.hiker.email}`}
                className="flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
              >
                <Mail className="h-4 w-4" />
                {booking.hiker.email}
              </a>
              <a
                href={`tel:${booking.hiker.phone}`}
                className="flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
              >
                <Phone className="h-4 w-4" />
                {booking.hiker.phone}
              </a>
            </div>

            <Separator />

            {/* All Participants */}
            <div>
              <h3 className="font-semibold text-charcoal mb-3">
                All Participants ({participants.length})
              </h3>
              <div className="space-y-3">
                {participants.map((participant: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-md">
                    <div>
                      <p className="font-medium text-charcoal">
                        {participant.firstName} {participant.surname}
                      </p>
                      <p className="text-sm text-charcoal/60">Age: {participant.age}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Special Requests */}
            {booking.special_requests && (
              <>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Special Requests</h3>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-900">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-charcoal">{booking.special_requests}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Emergency Contact */}
            {emergencyContact && (
              <div>
                <h3 className="font-semibold text-charcoal mb-2">Emergency Contact</h3>
                <div className="space-y-1">
                  <p className="font-medium text-charcoal">{emergencyContact.name}</p>
                  <p className="text-sm text-charcoal/60">{emergencyContact.relationship}</p>
                  <p className="text-sm text-charcoal/60">{emergencyContact.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Center Column - Tour Details */}
        <Card className="bg-cream/30">
          <CardHeader>
            <CardTitle className="text-lg font-playfair">Tour Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tour Name */}
            <div>
              <h3 className="font-semibold text-lg text-charcoal">{booking.tour.title}</h3>
              <p className="text-sm text-charcoal/60">{booking.tour.duration} challenging trek</p>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-charcoal/60">Date</p>
                <p className="font-medium text-charcoal">
                  {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-charcoal/60">Time</p>
                <p className="font-medium text-charcoal">08:00 AM</p>
              </div>
            </div>

            <Separator />

            {/* Meeting Location */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-burgundy" />
                <h3 className="font-semibold text-charcoal">Meeting Location</h3>
              </div>
              <p className="text-sm text-charcoal/60 whitespace-pre-line">
                {booking.tour.meeting_point}
              </p>
            </div>

            <Separator />

            {/* Equipment Checklist */}
            <div>
              <h3 className="font-semibold text-charcoal mb-3">Equipment Checklist</h3>
              <div className="space-y-2">
                {booking.tour.includes?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox 
                      id={`equipment-${index}`} 
                      checked={index < 2}
                      className="data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy"
                    />
                    <label
                      htmlFor={`equipment-${index}`}
                      className="text-sm text-charcoal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Weather Forecast */}
            <div>
              <h3 className="font-semibold text-charcoal mb-3">Weather Forecast</h3>
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-md">
                <CloudSun className="h-8 w-8 text-gold" />
                <div>
                  <p className="font-medium text-charcoal">Sunny</p>
                  <p className="text-sm text-charcoal/60">
                    15°C • High: 18°C • Low: 10°C
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Waiver Status */}
            <div>
              <h3 className="font-semibold text-charcoal mb-3">Waiver Status</h3>
              <div className="space-y-2">
                {participants.map((participant: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded-md">
                    <p className="text-sm text-charcoal">
                      {participant.firstName} {participant.surname}
                    </p>
                    <Badge className="bg-sage text-white">
                      Signed
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Information - Show when booking is refunded */}
            {booking.refund_status && booking.refund_status === 'succeeded' && (
              <>
                <Separator />
                <div className="bg-burgundy/10 border border-burgundy/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-burgundy" />
                    <h3 className="font-semibold text-burgundy">Refund Information</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Refund Amount:</span>
                      <span className="font-medium text-charcoal">
                        {booking.refund_amount} {booking.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Refund Status:</span>
                      <Badge className="bg-burgundy text-white">
                        {booking.refund_status}
                      </Badge>
                    </div>
                    {booking.refunded_at && (
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Refunded At:</span>
                        <span className="font-medium text-charcoal">
                          {format(new Date(booking.refunded_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    )}
                    {booking.refund_reason && (
                      <div className="pt-2 border-t border-burgundy/10">
                        <span className="text-charcoal/60">Reason:</span>
                        <p className="text-charcoal mt-1">{booking.refund_reason}</p>
                      </div>
                    )}
                    {booking.stripe_refund_id && (
                      <div className="pt-2">
                        <span className="text-xs text-charcoal/40">
                          Stripe Refund ID: {booking.stripe_refund_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Actions */}
        <Card className="bg-cream/30">
          <CardHeader>
            <CardTitle className="text-lg font-playfair">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conditional Action Buttons */}
            {(booking.status === 'pending' || booking.status === 'pending_confirmation') && (
              <>
                <Button
                  className="w-full bg-sage hover:bg-sage/90 text-white"
                  onClick={handleAcceptBooking}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept Booking
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-burgundy hover:text-burgundy hover:bg-burgundy/10"
                  onClick={() => setShowDeclineDialog(true)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline Booking
                </Button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-burgundy hover:text-burgundy hover:bg-burgundy/10"
                  onClick={handleDeclineBooking}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              </>
            )}

            <Separator />

            {/* Emergency Contact */}
            <div>
              <h3 className="font-semibold text-charcoal mb-2">Emergency Contact</h3>
              {emergencyContact && (
                <Button
                  className="w-full bg-burgundy hover:bg-burgundy/90 text-white"
                  asChild
                >
                  <a href={`tel:${emergencyContact.phone}`}>
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call Emergency Number
                  </a>
                </Button>
              )}
            </div>

            <Separator />

            {/* Messages */}
            <div>
              <h3 className="font-semibold text-charcoal mb-2">Messages</h3>
              <Button
                className="w-full bg-burgundy hover:bg-burgundy/90 text-white"
                onClick={() => setShowMessagesModal(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View Messages (2)
              </Button>
              <p className="text-xs text-charcoal/50 text-center mt-2">
                Last message: 1 hour ago
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Modal */}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        booking={{
          ...booking,
          tour_id: booking.tour.id,
          hiker_id: booking.hiker.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any}
      />

      {/* Decline Booking Confirmation Dialog */}
      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-playfair text-charcoal flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-burgundy" />
              Decline This Booking?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-base">
              <p className="text-charcoal/80">
                This action <strong className="text-burgundy">cannot be undone</strong>. When you decline this booking:
              </p>
              <ul className="list-disc list-inside space-y-2 text-charcoal/70 ml-2">
                <li>The full payment will be <strong>automatically refunded</strong> to the hiker</li>
                <li>The hiker will receive an <strong>email notification</strong> about the cancellation</li>
                <li>The booking status will be changed to <strong>cancelled</strong></li>
                <li>The date slot will become available for other bookings</li>
              </ul>
              <div className="bg-burgundy/10 border border-burgundy/20 rounded-lg p-4 mt-4">
                <p className="text-sm text-burgundy font-medium">
                  ⚠️ Refunds typically appear in the hiker's account within 3-10 business days
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-charcoal/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeclineBooking}
              className="bg-burgundy hover:bg-burgundy/90 text-white"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Yes, Decline & Refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
