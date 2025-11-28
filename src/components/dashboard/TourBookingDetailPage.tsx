import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useChatMessageTemplates } from '@/hooks/useChatMessageTemplates';
import { useToast } from '@/hooks/use-toast';
import { replaceTemplateVariables, extractFirstName, extractLastName, formatMessageDate } from '@/utils/templateVariables';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Mail, Phone, Download, FileText, Send, Paperclip, Package, Edit3, Check } from 'lucide-react';
import WeatherForecastCard from './WeatherForecastCard';
import { ParticipantCard } from './ParticipantCard';
import { useState as useDialogState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PackingListManagerV2 from '@/components/packing-list/PackingListManagerV2';
import type { PackingListData } from '@/types/packingList';
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
  waiver_uploaded_at: string | null;
  insurance_uploaded_at: string | null;
  waiver_data: any | null;
  hiker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    country?: string | null;
    avatar_url: string | null;
    dietary_preferences?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    emergency_contact_country?: string | null;
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
  packing_list?: any; // JSON field from database
}
export function TourBookingDetailPage() {
  const {
    tourSlug
  } = useParams();
  const [searchParams] = useSearchParams();
  const dateFilter = searchParams.get('date');
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    toast
  } = useToast();
  const {
    templates: chatTemplates,
    isLoading: templatesLoading
  } = useChatMessageTemplates(user?.id);
  const [tour, setTour] = useState<TourDetails | null>(null);
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupMessage, setGroupMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [packingListModalOpen, setPackingListModalOpen] = useState(false);
  const [completingTour, setCompletingTour] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  useEffect(() => {
    if (tourSlug && user) {
      fetchTourAndBookings();
    }
  }, [tourSlug, user, dateFilter]);
  const fetchTourAndBookings = async () => {
    try {
      setLoading(true);

      // Fetch tour details
      const {
        data: tourData,
        error: tourError
      } = await supabase.from('tours').select('*').eq('slug', tourSlug).eq('guide_id', user?.id).single();
      if (tourError) throw tourError;
      setTour(tourData as TourDetails);

      // Fetch bookings for this tour, filtered by date if specified
      let bookingsQuery = supabase.from('bookings').select(`
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
          waiver_uploaded_at,
          insurance_uploaded_at,
          waiver_data,
          hiker:profiles!bookings_hiker_id_fkey (
            id,
            name,
            email,
            phone,
            country,
            avatar_url,
            dietary_preferences,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            emergency_contact_country
          )
        `).eq('tour_id', tourData.id).in('status', ['confirmed', 'pending', 'pending_confirmation', 'completed']);

      // Filter by specific date if provided
      if (dateFilter) {
        bookingsQuery = bookingsQuery.eq('booking_date', dateFilter);
      }
      const {
        data: bookingsData,
        error: bookingsError
      } = await bookingsQuery.order('booking_date', {
        ascending: true
      });
      if (bookingsError) throw bookingsError;

      // Fetch participant tokens for all bookings to get accurate completion status
      const bookingIds = (bookingsData || []).map((b: any) => b.id);
      const {
        data: tokensData
      } = await supabase.from('participant_tokens').select('*').in('booking_id', bookingIds);

      // Create a map of participant tokens by booking_id and participant_index
      const tokensByBooking = new Map<string, Map<number, any>>();
      (tokensData || []).forEach((token: any) => {
        if (!tokensByBooking.has(token.booking_id)) {
          tokensByBooking.set(token.booking_id, new Map());
        }
        tokensByBooking.get(token.booking_id)!.set(token.participant_index, token);
      });

      // Normalize bookings: use participant token data for accurate status
      const normalizedBookings = (bookingsData || []).map((booking: any) => {
        const participantsDetails = booking.participants_details || [];
        const bookingTokens = tokensByBooking.get(booking.id);
        const normalizedParticipants = participantsDetails.map((participant: any, index: number) => {
          const token = bookingTokens?.get(index);

          // Use token data if available, otherwise fall back to booking-level data for lead hiker
          if (token) {
            return {
              ...participant,
              waiverStatus: token.waiver_completed ? 'completed' : undefined,
              waiverSubmittedAt: token.waiver_completed ? new Date().toISOString() : undefined,
              insuranceStatus: token.insurance_completed ? 'verified' : undefined,
              insuranceSubmittedAt: token.insurance_completed ? new Date().toISOString() : undefined,
              participantTokenId: token.id,
              invitedAt: token.created_at,
              completedAt: token.completed_at
            };
          }

          // Fallback for lead hiker (index 0) using old booking-level data
          if (index === 0 && !participant.waiverStatus) {
            return {
              ...participant,
              waiverStatus: booking.waiver_uploaded_at || booking.waiver_data ? 'completed' : undefined,
              waiverSubmittedAt: booking.waiver_uploaded_at,
              waiverData: booking.waiver_data,
              insuranceStatus: booking.insurance_uploaded_at ? 'verified' : undefined,
              insuranceSubmittedAt: booking.insurance_uploaded_at
            };
          }
          return participant;
        });
        return {
          ...booking,
          participants_details: normalizedParticipants
        };
      });
      setBookings(normalizedBookings as TourBooking[]);
    } catch (error) {
      console.error('Error fetching tour bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tour booking details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSendGroupMessage = async () => {
    if (!groupMessage.trim() || !tour) return;
    if (sendingMessage) return; // Prevent double-clicks

    setSendingMessage(true);
    try {
      // Get all unique hiker IDs from bookings with their info
      const uniqueHikers = new Map();
      bookings.forEach(b => {
        if (!uniqueHikers.has(b.hiker.id)) {
          uniqueHikers.set(b.hiker.id, {
            id: b.hiker.id,
            name: b.hiker.name,
            tourDate: b.booking_date,
            participants: b.participants
          });
        }
      });
      let successCount = 0;
      let failCount = 0;

      // Send personalized message to each hiker
      for (const [hikerId, hikerInfo] of uniqueHikers) {
        try {
          // Personalize message for this specific hiker
          const personalizedMessage = replaceTemplateVariables(groupMessage, {
            guestFirstName: extractFirstName(hikerInfo.name),
            guestLastName: extractLastName(hikerInfo.name),
            guestFullName: hikerInfo.name || 'Guest',
            tourName: tour.title,
            tourDate: formatMessageDate(hikerInfo.tourDate),
            guestCount: hikerInfo.participants,
            guideName: profile?.name || 'Your guide',
            meetingPoint: tour.meeting_point || 'the meeting point',
            startTime: (tour as any).meeting_time || 'Meeting time to be confirmed'
          });

          // Find or create conversation
          let {
            data: conversation,
            error: fetchError
          } = await supabase.from('conversations').select('id').eq('tour_id', tour.id).eq('hiker_id', hikerId).eq('guide_id', user?.id).eq('conversation_type', 'booking_chat').maybeSingle();
          if (fetchError) {
            console.error('Error fetching conversation:', fetchError);
            failCount++;
            continue;
          }

          // Create conversation if it doesn't exist
          if (!conversation) {
            const {
              data: newConv,
              error: createError
            } = await supabase.from('conversations').insert({
              tour_id: tour.id,
              hiker_id: hikerId,
              guide_id: user?.id,
              conversation_type: 'booking_chat'
            }).select('id').single();
            if (createError) {
              console.error('Error creating conversation:', createError);
              failCount++;
              continue;
            }
            conversation = newConv;
          }
          const conversationId = conversation?.id;
          if (!conversationId) {
            console.error('No conversation ID available');
            failCount++;
            continue;
          }

          // Send personalized message using edge function
          const {
            error: sendError
          } = await supabase.functions.invoke('send-message', {
            body: {
              conversationId: conversationId,
              content: personalizedMessage,
              senderType: 'guide',
              senderName: user?.email
            }
          });
          if (sendError) {
            console.error('Error sending message:', sendError);
            failCount++;
            continue;
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to send message to hiker ${hikerId}:`, error);
          failCount++;
        }
      }

      // Clear loading state first
      setSendingMessage(false);

      // Then show results
      if (successCount > 0) {
        setGroupMessage('');
        toast({
          title: 'Success',
          description: `Message sent to ${successCount} participant${successCount > 1 ? 's' : ''}${failCount > 0 ? ` (${failCount} failed)` : ''}`
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send messages to any participants',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending group message:', error);
      setSendingMessage(false);
      toast({
        title: 'Error',
        description: 'Failed to send group message',
        variant: 'destructive'
      });
    }
  };
  const handleSendReminder = async (hikerId: string, type: 'waiver' | 'insurance', participantIndex: number) => {
    try {
      const booking = bookings.find(b => b.hiker.id === hikerId);
      const participant = booking?.participants_details[participantIndex];
      if (!booking || !participant || !tour) return;
      const template = chatTemplates.find(t => type === 'waiver' ? t.name.toLowerCase().includes('waiver') : t.name.toLowerCase().includes('insurance'));
      const reminderMessage = template?.message_content || `Hi ${participant.firstName}, friendly reminder to submit your ${type} for ${tour.title}.`;
      const {
        data: conversation
      } = await supabase.from('conversations').select('id').eq('tour_id', tour.id).eq('hiker_id', hikerId).maybeSingle();
      let conversationId = conversation?.id;
      if (!conversationId) {
        const {
          data: newConv
        } = await supabase.from('conversations').insert({
          guide_id: user?.id,
          hiker_id: hikerId,
          tour_id: tour.id,
          conversation_type: 'booking_chat'
        }).select('id').single();
        conversationId = newConv?.id;
      }
      await supabase.functions.invoke('send-message', {
        body: {
          conversationId,
          senderId: user?.id,
          senderType: 'guide',
          content: reminderMessage,
          messageType: 'text'
        }
      });
      toast({
        title: 'Reminder Sent',
        description: `${type} reminder sent to ${participant.firstName} ${participant.surname}`
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
      variant: 'destructive'
    });
  }
};

const handleCompleteTour = async () => {
  if (completingTour) return;
  
  try {
    setCompletingTour(true);
    
    const bookingIds = bookings.map(b => b.id);
    let successCount = 0;
    let failCount = 0;

    // Update all bookings to completed status
    for (const bookingId of bookingIds) {
      try {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('id', bookingId);

        if (updateError) throw updateError;

        // Trigger review creation
        const { error: reviewError } = await supabase.functions.invoke('process-tour-completions', {
          body: { booking_id: bookingId, immediate: true }
        });

        if (reviewError) {
          console.error(`Error creating reviews for booking ${bookingId}:`, reviewError);
        }

        successCount++;
      } catch (error) {
        console.error(`Error completing booking ${bookingId}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: 'Success',
        description: `${successCount} booking${successCount > 1 ? 's' : ''} marked as completed${failCount > 0 ? ` (${failCount} failed)` : ''}. Reviews are now available.`
      });
      
      // Refresh data
      fetchTourAndBookings();
    } else {
      throw new Error('Failed to complete any bookings');
    }
  } catch (error) {
    console.error('Error completing tour:', error);
    toast({
      title: 'Error',
      description: 'Failed to mark tour as completed',
      variant: 'destructive'
    });
  } finally {
    setCompletingTour(false);
  }
};
  const handleSendDocumentsEmail = async () => {
    if (!tour || !profile?.email) {
      toast({
        title: 'Error',
        description: 'Missing tour or guide email information',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSendingMessage(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('send-participant-documents', {
        body: {
          tourId: tour.id,
          tourDate: dateFilter || null,
          guideEmail: profile.email
        }
      });
      if (error) throw error;
      toast({
        title: 'Documents Sent',
        description: `Participant documents summary has been sent to ${profile.email}`
      });
    } catch (error: any) {
      console.error('Error sending documents:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send documents email',
        variant: 'destructive'
      });
    } finally {
      setSendingMessage(false);
    }
  };
  const handleExportParticipants = () => {
    // Create CSV content with comprehensive participant information
    const headers = ['Name', 'Email', 'Phone', 'Booking Date', 'Participants', 'Status', 'Dietary Requirements', 'Emergency Contact Name', 'Emergency Contact Phone', 'Emergency Contact Relationship'];
    const rows = bookings.map(booking => {
      // Handle dietary preferences array - capitalize for display
      const dietaryReqs = booking.hiker.dietary_preferences && Array.isArray(booking.hiker.dietary_preferences) ? booking.hiker.dietary_preferences.map(pref => pref.charAt(0).toUpperCase() + pref.slice(1)).join('; ') : 'None';
      const phoneWithCountry = booking.hiker.phone ? `${booking.hiker.country || ''}${booking.hiker.phone}` : '';
      const emergencyPhoneWithCountry = booking.hiker.emergency_contact_phone ? `${booking.hiker.emergency_contact_country || ''}${booking.hiker.emergency_contact_phone}` : '';
      return [booking.hiker.name, booking.hiker.email, phoneWithCountry, format(new Date(booking.booking_date), 'yyyy-MM-dd'), booking.participants.toString(), booking.status === 'pending_confirmation' ? 'Confirmed' : booking.status, dietaryReqs, booking.hiker.emergency_contact_name || '', emergencyPhoneWithCountry, booking.hiker.emergency_contact_relationship || ''];
    });
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tour?.slug}-participants-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get active chat templates from database - keep variables intact for personalization
  const quickTemplates = chatTemplates.filter(t => t.is_active).sort((a, b) => a.sort_order - b.sort_order).map(template => ({
    icon: FileText,
    label: template.name,
    message: template.message_content // Keep template variables for personalization per recipient
  }));
  if (loading) {
    return <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>;
  }
  if (!tour) {
    return <div className="p-6">
        <Card className="border-burgundy/10">
          <CardContent className="pt-6">
            <p className="text-charcoal/60">Tour not found</p>
          </CardContent>
        </Card>
      </div>;
  }
  const totalParticipants = bookings.reduce((sum, b) => sum + b.participants, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);
  const currency = bookings[0]?.currency || 'EUR';
  const pricePerPerson = tour.price_per_person || (bookings[0] ? Math.round(bookings[0].total_price / bookings[0].participants) : 0);
  return <div className="p-6 space-y-6">
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
      <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard?section=bookings')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tours List
      </Button>

      {/* Hero Section */}
      <Card className="overflow-hidden border-burgundy/10">
        <div className="relative h-64">
          {tour.hero_image ? <img src={tour.hero_image} alt={tour.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-cream flex items-center justify-center">
              <MapPin className="w-16 h-16 text-charcoal/40" />
            </div>}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/15 to-transparent" />
          
          {/* Complete Tour Button - Top Right */}
          {bookings.length > 0 && bookings.every(b => b.status === 'confirmed') && (
            <div className="absolute top-4 right-4">
              <Button
                onClick={() => setShowCompleteDialog(true)}
                disabled={completingTour}
                className="bg-burgundy hover:bg-burgundy-dark text-white shadow-lg"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark Tour as Completed
              </Button>
            </div>
          )}

          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-playfair mb-2">{tour.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {bookings.length > 0 ? (() => {
                const uniqueDates = [...new Set(bookings.map(b => b.booking_date))].sort();
                return uniqueDates.length === 1 ? format(new Date(uniqueDates[0]), 'MMM dd, yyyy') : `${format(new Date(uniqueDates[0]), 'MMM dd')} - ${format(new Date(uniqueDates[uniqueDates.length - 1]), 'MMM dd, yyyy')}`;
              })() : 'No dates'}
              </span>
              {tour.location && <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tour.location}
                </span>}
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
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="text-sm text-charcoal/60 mb-1">MEETING POINT</div>
              <div className="font-medium text-charcoal">{tour.meeting_point}</div>
              {tour.meeting_point_lat && tour.meeting_point_lng && <div className="text-sm text-charcoal/60 mt-1">
                  {tour.meeting_point_lat.toFixed(4)}°N, {tour.meeting_point_lng.toFixed(4)}°E
                </div>}
            </div>

            {/* Compact Equipment Checklist */}
            {tour.packing_list && (tour.packing_list as any)?.enabled && (
              <div className="pt-4 border-t border-burgundy/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-burgundy" />
                    <span className="text-sm font-medium text-charcoal">Equipment Checklist</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setPackingListModalOpen(true)}
                    className="h-7 text-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal/60">
                  <span className="capitalize">
                    {((tour.packing_list as any)?.preset || 'custom').replace(/-/g, ' ')}
                  </span>
                  <span>•</span>
                  <span>{((tour.packing_list as any)?.customItems?.length || 0)} custom items</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Forecast */}
        {tour.meeting_point_lat && tour.meeting_point_lng && bookings.length > 0 && <WeatherForecastCard location={tour.meeting_point} latitude={tour.meeting_point_lat} longitude={tour.meeting_point_lng} date={bookings[0].booking_date} />}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants List */}
        <Card className="border-burgundy/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-playfair text-charcoal">Participants ({totalParticipants})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSendDocumentsEmail} disabled={sendingMessage}>
                <Mail className="w-4 h-4 mr-2" />
                Email Docs
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportParticipants}>
                <Download className="w-4 h-4 mr-2" />
                Export List
              </Button>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-burgundy/10">
            {bookings.map(booking => <ParticipantCard key={booking.id} booking={booking} tourDate={booking.booking_date} onSendReminder={handleSendReminder} />)}
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
              {templatesLoading ? <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div> : quickTemplates.length > 0 ? <div className="grid grid-cols-2 gap-2">
                  {quickTemplates.map((template, idx) => <Button key={idx} variant="outline" size="sm" className="justify-start h-auto py-2 px-3 text-left" onClick={() => setGroupMessage(template.message)}>
                      <template.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-xs line-clamp-1">{template.label}</span>
                    </Button>)}
                </div> : <p className="text-sm text-muted-foreground">
                  No active chat templates. Set them up in the Inbox section.
                </p>}
            </div>

            <Separator />

            {/* Message Input */}
            <div>
              <div className="text-sm font-medium text-charcoal mb-2">Message</div>
              <Textarea placeholder="Type your message to all participants..." value={groupMessage} onChange={e => setGroupMessage(e.target.value)} rows={6} className="resize-none" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 border-burgundy/20 text-charcoal hover:bg-burgundy/10" onClick={() => setGroupMessage('')}>
                Clear
              </Button>
              <Button size="sm" className="flex-1 bg-burgundy hover:bg-burgundy/90 text-white" onClick={handleSendGroupMessage} disabled={!groupMessage.trim() || sendingMessage}>
                <Send className="w-4 h-4 mr-2" />
                Send to All ({totalParticipants})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packing List Edit Modal */}
      <Dialog open={packingListModalOpen} onOpenChange={setPackingListModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-playfair text-charcoal">
              <Package className="w-5 h-5 text-burgundy" />
              Edit Equipment Checklist
            </DialogTitle>
            <DialogDescription>
              Update the packing list for {tour?.title}
            </DialogDescription>
          </DialogHeader>
          <PackingListManagerV2
            tourType={((tour?.packing_list as any)?.preset)}
            existingList={tour?.packing_list}
            onSave={async (listData) => {
              try {
                const { error } = await supabase
                  .from('tours')
                  .update({ 
                    packing_list: {
                      enabled: true,
                      preset: listData.preset,
                      customItems: listData.customItems || [],
                      guideNotes: listData.guideNotes || '',
                      lastUpdated: new Date().toISOString()
                    }
                  })
                  .eq('id', tour?.id);

                if (error) throw error;

                // Refetch tour data
                await fetchTourAndBookings();
                
                setPackingListModalOpen(false);
                toast({
                  title: 'Success',
                  description: 'Packing list updated successfully',
                });
              } catch (error) {
                console.error('Error updating packing list:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to update packing list',
                  variant: 'destructive'
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Complete Tour Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Tour as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all {bookings.length} booking{bookings.length > 1 ? 's' : ''} for this tour date as completed and trigger review requests to all participants.
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCompleteDialog(false);
                handleCompleteTour();
              }}
              className="bg-burgundy hover:bg-burgundy-dark text-white"
            >
              Mark as Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}