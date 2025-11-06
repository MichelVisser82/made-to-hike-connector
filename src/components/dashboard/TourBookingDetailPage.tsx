import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Mail,
  Phone,
  Download,
  FileText,
  Send,
  Paperclip,
} from 'lucide-react';
import WeatherForecastCard from './WeatherForecastCard';

interface TourBooking {
  id: string;
  booking_reference: string;
  booking_date: string;
  participants: number;
  participants_details: any[];
  total_price: number;
  currency: string;
  status: string;
  special_requests: string | null;
  created_at: string;
  hiker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
    dietary_preferences?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
  };
}

interface TourDetails {
  id: string;
  title: string;
  slug: string;
  duration: string;
  meeting_point: string;
  meeting_point_lat: number | null;
  meeting_point_lng: number | null;
  hero_image: string | null;
  difficulty: string;
  max_group_size: number;
  location?: string;
  price_per_person?: number;
}

export function TourBookingDetailPage() {
  const { tourSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tour, setTour] = useState<TourDetails | null>(null);
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupMessage, setGroupMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (tourSlug && user) {
      fetchTourAndBookings();
    }
  }, [tourSlug, user]);

  const fetchTourAndBookings = async () => {
    try {
      setLoading(true);

      // Fetch tour details
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', tourSlug)
        .eq('guide_id', user?.id)
        .single();

      if (tourError) throw tourError;
      setTour(tourData as TourDetails);

      // Fetch bookings for this tour
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          booking_date,
          participants,
          participants_details,
          total_price,
          currency,
          status,
          special_requests,
          created_at,
          hiker:profiles!bookings_hiker_id_fkey (
            id,
            name,
            email,
            phone,
            avatar_url,
            dietary_preferences,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship
          )
        `)
        .eq('tour_id', tourData.id)
        .in('status', ['confirmed', 'pending', 'pending_confirmation', 'completed'])
        .order('booking_date', { ascending: true });

      if (bookingsError) throw bookingsError;
      setBookings((bookingsData || []) as TourBooking[]);
    } catch (error) {
      console.error('Error fetching tour bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tour booking details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendGroupMessage = async () => {
    if (!groupMessage.trim() || !tour) return;

    try {
      setSendingMessage(true);

      // Get all unique hiker IDs from bookings
      const hikerIds = [...new Set(bookings.map(b => b.hiker.id))];
      let successCount = 0;
      let failCount = 0;

      // Send message to each hiker sequentially to avoid overwhelming the system
      for (const hikerId of hikerIds) {
        try {
          // Find or create conversation
          let { data: conversation, error: fetchError } = await supabase
            .from('conversations')
            .select('id')
            .eq('tour_id', tour.id)
            .eq('hiker_id', hikerId)
            .eq('guide_id', user?.id)
            .eq('conversation_type', 'booking_chat')
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching conversation:', fetchError);
            throw fetchError;
          }

          // Create conversation if it doesn't exist
          if (!conversation) {
            const { data: newConv, error: createError } = await supabase
              .from('conversations')
              .insert({
                tour_id: tour.id,
                hiker_id: hikerId,
                guide_id: user?.id,
                conversation_type: 'booking_chat'
              })
              .select('id')
              .single();
            
            if (createError) {
              console.error('Error creating conversation:', createError);
              throw createError;
            }
            
            conversation = newConv;
          }

          const conversationId = conversation?.id;

          if (conversationId) {
            // Send message using edge function with correct parameters
            const { error: sendError } = await supabase.functions.invoke('send-message', {
              body: {
                conversationId: conversationId,
                content: groupMessage,
                senderType: 'guide',
                senderName: user?.email
              },
            });

            if (sendError) {
              console.error('Error sending message:', sendError);
              throw sendError;
            }

            successCount++;
          }
        } catch (error) {
          console.error(`Failed to send message to hiker ${hikerId}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `Message sent to ${successCount} participant${successCount > 1 ? 's' : ''}${failCount > 0 ? ` (${failCount} failed)` : ''}`,
        });
        setGroupMessage('');
      } else {
        throw new Error('Failed to send messages to any participants');
      }
    } catch (error) {
      console.error('Error sending group message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send group message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleExportParticipants = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Booking Date', 'Participants', 'Status', 'Dietary', 'Emergency Contact'];
    const rows = bookings.map(booking => [
      booking.hiker.name,
      booking.hiker.email,
      booking.hiker.phone || '',
      format(new Date(booking.booking_date), 'yyyy-MM-dd'),
      booking.participants.toString(),
      booking.status,
      booking.participants_details?.[0]?.dietaryPreferences || '',
      booking.participants_details?.[0]?.emergencyContactName || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tour?.slug}-participants.csv`;
    a.click();
  };

  const quickTemplates = [
    {
      icon: FileText,
      label: 'Welcome & Trip Preparation',
      message: `Hello everyone! I'm excited to have you join the ${tour?.title}. Please make sure to bring appropriate hiking gear and check the weather forecast. Looking forward to meeting you!`,
    },
    {
      icon: FileText,
      label: '48-Hour Reminder',
      message: `Hi team! Just a friendly reminder that our ${tour?.title} is coming up in 48 hours. Meeting point: ${tour?.meeting_point}. See you soon!`,
    },
    {
      icon: FileText,
      label: 'Weather Update',
      message: `Weather update for our upcoming tour: Conditions look favorable for hiking. Please dress in layers and bring rain gear just in case.`,
    },
    {
      icon: FileText,
      label: 'Post-Trip Thank You',
      message: `Thank you all for joining the ${tour?.title}! It was a pleasure guiding you. I'd appreciate if you could leave a review of your experience.`,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-6">
        <Card className="border-burgundy/10">
          <CardContent className="pt-6">
            <p className="text-charcoal/60">Tour not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalParticipants = bookings.reduce((sum, b) => sum + b.participants, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);
  const currency = bookings[0]?.currency || 'EUR';
  const pricePerPerson = tour.price_per_person || (bookings[0] ? Math.round(bookings[0].total_price / bookings[0].participants) : 0);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard?section=bookings">Bookings</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>By Tour ({bookings.length})</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/dashboard?section=bookings')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tours List
      </Button>

      {/* Hero Section */}
      <Card className="overflow-hidden border-burgundy/10">
        <div className="relative h-64">
          {tour.hero_image ? (
            <img
              src={tour.hero_image}
              alt={tour.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-cream flex items-center justify-center">
              <MapPin className="w-16 h-16 text-charcoal/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/15 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-playfair mb-2">{tour.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {bookings.length > 0 ? `${format(new Date(bookings[0].booking_date), 'MMM dd')} - ${format(new Date(bookings[bookings.length - 1].booking_date), 'dd, yyyy')}` : 'No dates'}
              </span>
              {tour.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tour.location}
                </span>
              )}
              <Badge variant="secondary" className="bg-white/90 text-charcoal">
                {tour.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-burgundy/10">
          <CardContent className="pt-6">
            <div className="text-sm text-charcoal/60 mb-1">DURATION</div>
            <div className="text-2xl font-semibold text-charcoal">{tour.duration}</div>
          </CardContent>
        </Card>
        <Card className="border-burgundy/10">
          <CardContent className="pt-6">
            <div className="text-sm text-charcoal/60 mb-1">PARTICIPANTS</div>
            <div className="text-2xl font-semibold text-charcoal">
              {totalParticipants} / {tour.max_group_size}
            </div>
          </CardContent>
        </Card>
        <Card className="border-burgundy/10">
          <CardContent className="pt-6">
            <div className="text-sm text-charcoal/60 mb-1">PRICE</div>
            <div className="text-2xl font-semibold text-charcoal">
              €{pricePerPerson} per person
            </div>
          </CardContent>
        </Card>
        <Card className="border-burgundy/10">
          <CardContent className="pt-6">
            <div className="text-sm text-charcoal/60 mb-1">TOTAL BOOKINGS</div>
            <div className="text-2xl font-semibold text-charcoal">{bookings.length} bookings</div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Point and Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-burgundy/10">
          <CardContent className="pt-6">
            <div className="text-sm text-charcoal/60 mb-1">MEETING POINT</div>
            <div className="font-medium text-charcoal">{tour.meeting_point}</div>
            {tour.meeting_point_lat && tour.meeting_point_lng && (
              <div className="text-sm text-charcoal/60 mt-1">
                {tour.meeting_point_lat.toFixed(4)}°N, {tour.meeting_point_lng.toFixed(4)}°E
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Forecast */}
        {tour.meeting_point_lat && tour.meeting_point_lng && bookings.length > 0 && (
          <WeatherForecastCard
            location={tour.meeting_point}
            latitude={tour.meeting_point_lat}
            longitude={tour.meeting_point_lng}
            date={bookings[0].booking_date}
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants List */}
        <Card className="border-burgundy/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-playfair text-charcoal">Participants ({totalParticipants})</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportParticipants}>
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-charcoal">{booking.hiker.name}</p>
                  <Link 
                    to={`/dashboard/bookings/${booking.id}`}
                    className="text-sm text-burgundy hover:text-burgundy/80 hover:underline transition-colors"
                  >
                    #{booking.booking_reference}
                  </Link>
                </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs mt-1 ${
                        booking.status === 'confirmed' || booking.status === 'pending_confirmation'
                          ? 'bg-sage/10 text-sage border-sage/20'
                          : booking.status === 'pending'
                          ? 'bg-gold/10 text-gold border-gold/20'
                          : 'bg-charcoal/10 text-charcoal border-charcoal/20'
                      }`}
                    >
                      {booking.status === 'pending_confirmation' ? 'Confirmed' : booking.status}
                    </Badge>
                  </div>
                  <div className="text-right text-sm text-charcoal/60">
                    <div>Booked {format(new Date(booking.created_at), 'MMM dd, yyyy')}</div>
                    <div className="font-medium text-charcoal">{booking.participants} people</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-charcoal/60">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {booking.hiker.email}
                  </span>
                  {booking.hiker.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {booking.hiker.phone}
                    </span>
                  )}
                </div>
                <div className="text-sm text-charcoal/60 flex items-start gap-1">
                  <span className="font-medium">Dietary:</span>
                  <span>
                    {booking.hiker.dietary_preferences && booking.hiker.dietary_preferences.length > 0
                      ? booking.hiker.dietary_preferences.join(', ')
                      : 'N/A'}
                  </span>
                </div>
                <div className="text-sm text-charcoal/60">
                  <span className="font-medium">Emergency Contact:</span>{' '}
                  {booking.hiker.emergency_contact_name || 'N/A'}
                  {booking.hiker.emergency_contact_phone && ` • ${booking.hiker.emergency_contact_phone}`}
                  {booking.hiker.emergency_contact_relationship && ` (${booking.hiker.emergency_contact_relationship})`}
                </div>
                {booking !== bookings[bookings.length - 1] && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Group Message */}
        <Card className="border-burgundy/10">
          <CardHeader>
            <CardTitle className="font-playfair text-charcoal">Group Message</CardTitle>
            <p className="text-sm text-charcoal/60">
              Send a message to all {totalParticipants} participants
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Templates */}
            <div>
              <div className="text-sm font-medium text-charcoal mb-2">Quick Templates</div>
              <div className="grid grid-cols-2 gap-2">
                {quickTemplates.map((template, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto py-2 px-3 text-left"
                    onClick={() => setGroupMessage(template.message)}
                  >
                    <template.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs line-clamp-1">{template.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Message Input */}
            <div>
              <div className="text-sm font-medium text-charcoal mb-2">Message</div>
              <Textarea
                placeholder="Type your message to all participants..."
                value={groupMessage}
                onChange={(e) => setGroupMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-burgundy/20 text-charcoal hover:bg-burgundy/10"
                onClick={() => setGroupMessage('')}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-burgundy hover:bg-burgundy/90 text-white"
                onClick={handleSendGroupMessage}
                disabled={!groupMessage.trim() || sendingMessage}
              >
                <Send className="w-4 h-4 mr-2" />
                Send to All ({totalParticipants})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
