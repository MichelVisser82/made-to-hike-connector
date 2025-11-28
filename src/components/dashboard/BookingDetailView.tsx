import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { HikingLocationMap } from "@/components/tour/HikingLocationMap";
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
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Sun,
  ChevronDown,
  Loader2,
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
    meeting_point_lat?: number;
    meeting_point_lng?: number;
    includes: string[];
  };
  hiker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    country: string | null;
    avatar_url: string | null;
    emergency_contact_name: string | null;
    emergency_contact_relationship: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_country: string | null;
  };
}

export function BookingDetailView() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  const [weatherSource, setWeatherSource] = useState<'open-meteo' | 'claude-seasonal' | null>(null);
  const [isForecast, setIsForecast] = useState<boolean>(true);

  const fetchConversationData = async () => {
    if (!booking || !user?.id) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const guideId = session?.user?.id;
      
      if (!guideId) return;

      // Find conversation for this booking
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id, last_message_at')
        .eq('tour_id', booking.tour.id)
        .eq('hiker_id', booking.hiker.id)
        .eq('guide_id', guideId)
        .maybeSingle();

      if (!conversation) return;

      setConversationId(conversation.id);
      setLastMessageAt(conversation.last_message_at);

      // Fetch messages to count unread
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          read_receipts:message_read_receipts(user_id)
        `)
        .eq('conversation_id', conversation.id);

      if (messages) {
        const unread = messages.filter(
          (msg) =>
            msg.sender_id !== guideId &&
            !msg.read_receipts?.some((r: any) => r.user_id === guideId)
        );
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  useEffect(() => {
    if (booking && user) {
      fetchConversationData();
    }
  }, [booking, user]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tour:tours(id, title, duration, meeting_point, meeting_point_lat, meeting_point_lng, includes),
          hiker:profiles!bookings_hiker_id_fkey(
            id, 
            name, 
            email, 
            phone,
            country,
            avatar_url,
            emergency_contact_name,
            emergency_contact_relationship,
            emergency_contact_phone,
            emergency_contact_country
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data as BookingWithDetails);
      
      // Fetch weather once booking data is loaded
      if (data) {
        fetchWeatherForecast(data as BookingWithDetails);
      }
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

  const fetchWeatherForecast = async (bookingData: BookingWithDetails) => {
    if (!bookingData?.tour.meeting_point || !bookingData?.booking_date) return;
    
    // Only fetch weather if GPS coordinates are available
    if (!bookingData.tour.meeting_point_lat || !bookingData.tour.meeting_point_lng) {
      console.log('Skipping weather fetch: GPS coordinates not available for this tour');
      return;
    }
    
    setWeatherLoading(true);
    setWeatherError(false);
    
    try {
      // Prepare request body with GPS coordinates
      const requestBody: any = {
        date: format(new Date(bookingData.booking_date), 'yyyy-MM-dd'),
        latitude: bookingData.tour.meeting_point_lat,
        longitude: bookingData.tour.meeting_point_lng,
        location: bookingData.tour.meeting_point
      };
      
      const { data, error } = await supabase.functions.invoke('get-weather-forecast', {
        body: requestBody
      });
      
      if (error) throw error;
      
      if (data.success) {
        setWeatherData(data.weather);
        setWeatherSource(data.source || 'open-meteo');
        setIsForecast(data.isForecast !== false);
      } else {
        setWeatherError(true);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
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

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="h-8 w-8 text-gold" />;
      case 'partly cloudy':
        return <CloudSun className="h-8 w-8 text-gold" />;
      case 'cloudy':
        return <Cloud className="h-8 w-8 text-charcoal/60" />;
      case 'rainy':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'stormy':
        return <CloudLightning className="h-8 w-8 text-burgundy" />;
      case 'snow':
        return <Snowflake className="h-8 w-8 text-blue-300" />;
      default:
        return <CloudSun className="h-8 w-8 text-gold" />;
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

  const emergencyContact = booking.hiker.emergency_contact_name ? {
    name: booking.hiker.emergency_contact_name,
    relationship: booking.hiker.emergency_contact_relationship || 'Not provided',
    phone: booking.hiker.emergency_contact_phone || 'Not provided'
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
                href={`tel:${booking.hiker.country || ''}${booking.hiker.phone}`}
                className="flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
              >
                <Phone className="h-4 w-4" />
                {booking.hiker.country}{booking.hiker.phone}
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

            {/* Waiver Status */}
            <div>
              <h3 className="font-semibold text-charcoal mb-3">Waiver Status</h3>
              <div className="space-y-2">
                {participants.map((participant: any, index: number) => {
                  const hasWaiver = participant.waiverStatus === 'completed' || participant.waiverSubmittedAt;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded-md">
                      <p className="text-sm text-charcoal">
                        {participant.firstName} {participant.surname}
                      </p>
                      {hasWaiver ? (
                        <Badge className="bg-sage text-white">
                          Signed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-700">
                          Pending
                        </Badge>
                      )}
                    </div>
                  );
                })}
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
                  <p className="text-sm text-charcoal/60">
                    {emergencyContact.phone === 'Not provided' 
                      ? emergencyContact.phone 
                      : `${booking.hiker.emergency_contact_country || ''}${emergencyContact.phone}`}
                  </p>
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
              <p className="text-sm text-charcoal/60 whitespace-pre-line mb-3">
                {booking.tour.meeting_point}
              </p>
              {booking.tour.meeting_point_lat && booking.tour.meeting_point_lng && (
                <div className="mt-3">
                  <HikingLocationMap
                    latitude={booking.tour.meeting_point_lat}
                    longitude={booking.tour.meeting_point_lng}
                    title={booking.tour.meeting_point}
                    height="200px"
                    zoom={14}
                    showControls={false}
                  />
                </div>
              )}
            </div>

            {/* Weather Forecast */}
            <div>
              <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
                <CloudSun className="h-5 w-5" />
                Weather Forecast for Tour Date
              </h3>
              {weatherLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-charcoal/60">Loading forecast...</span>
                </div>
              ) : weatherError ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    Weather forecast unavailable for this location
                  </p>
                </div>
              ) : weatherData ? (
                <>
                  <div className={`p-4 rounded-lg border ${
                    weatherSource === 'claude-seasonal' 
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800'
                      : 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-sky-200 dark:border-sky-800'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={weatherSource === 'claude-seasonal' ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'}>
                        {weatherSource === 'claude-seasonal' ? (
                          <Calendar className="h-8 w-8" />
                        ) : (
                          getWeatherIcon(weatherData.condition)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg text-charcoal dark:text-white">
                            {weatherData.condition}
                          </p>
                          {weatherSource === 'claude-seasonal' && (
                            <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs">
                              Seasonal Outlook
                            </Badge>
                          )}
                        </div>
                        {weatherData.temperature && (
                          <p className="text-base text-charcoal/80 dark:text-white/80 font-medium mt-1">
                            {weatherData.temperature}°C
                            {weatherData.high && weatherData.low && 
                              <span className="text-sm font-normal text-charcoal/60 dark:text-white/60 ml-2">
                                (High: {weatherData.high}°C • Low: {weatherData.low}°C)
                              </span>
                            }
                          </p>
                        )}
                        {weatherData.summary && (
                          <p className="text-sm text-charcoal/70 dark:text-white/70 mt-2 leading-relaxed">
                            {weatherData.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {weatherData.fullForecast && (
                    <Collapsible>
                      <CollapsibleTrigger className="text-sm text-charcoal/70 dark:text-white/70 hover:text-charcoal dark:hover:text-white flex items-center gap-1 mt-3 font-medium">
                        <ChevronDown className="h-4 w-4" />
                        View detailed {weatherSource === 'claude-seasonal' ? 'seasonal outlook' : 'forecast'}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="text-sm text-charcoal/80 dark:text-white/80 mt-3 p-4 bg-white dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-lg leading-relaxed whitespace-pre-line">
                        {weatherData.fullForecast}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  <p className={`text-xs mt-3 ${
                    weatherSource === 'claude-seasonal'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-charcoal/50 dark:text-white/50'
                  }`}>
                    {weatherSource === 'claude-seasonal' 
                      ? 'Seasonal outlook based on typical conditions • Accurate forecast available 16 days before your tour'
                      : `Forecast for ${format(new Date(booking!.booking_date), 'EEEE, MMMM d, yyyy')}`
                    }
                  </p>
                </>
              ) : (
                <p className="text-sm text-charcoal/60">
                  Weather data not available
                </p>
              )}
            </div>

            <Separator />

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
                  <a href={`tel:${booking.hiker.emergency_contact_country || ''}${emergencyContact.phone}`}>
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
                View Messages{unreadCount > 0 ? ` (${unreadCount})` : ''}
              </Button>
              {lastMessageAt && (
                <p className="text-xs text-charcoal/50 text-center mt-2">
                  Last message: {formatDistanceToNow(new Date(lastMessageAt), { addSuffix: true })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Modal */}
      {conversationId && (
        <MessagesModal
          isOpen={showMessagesModal}
          onClose={() => {
            setShowMessagesModal(false);
            fetchConversationData(); // Refresh counts after closing modal
          }}
          booking={{
            ...booking,
            tour_id: booking.tour.id,
            hiker_id: booking.hiker.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any}
        />
      )}

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
