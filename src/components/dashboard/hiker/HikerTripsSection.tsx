import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Clock, Star, Heart, Eye, MessageCircle, CheckCircle, AlertTriangle, RefreshCw, FileText, Route, ChevronDown, ChevronUp, Camera, Trash2, Award } from 'lucide-react';
import { useHikerBookings } from '@/hooks/useHikerBookings';
import { useSavedTours } from '@/hooks/useSavedTours';
import { useFollowedGuides } from '@/hooks/useFollowedGuides';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { HikingLocationMap } from '@/components/tour/HikingLocationMap';

interface HikerTripsSectionProps {
  userId: string;
  onViewTour: (tourId: string) => void;
  onMessageGuide: (guideId: string) => void;
}

export function HikerTripsSection({ userId, onViewTour, onMessageGuide }: HikerTripsSectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { bookings, loading, error } = useHikerBookings(userId);
  const { savedTours, isLoading: loadingSavedTours, toggleSaveTour } = useSavedTours(userId);
  const { followedGuides, isLoading: loadingFollowedGuides, toggleFollowGuide } = useFollowedGuides(userId);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Modal states
  const [itineraryModal, setItineraryModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [preparationModal, setPreparationModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [meetingPointModal, setMeetingPointModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId || bookings.length === 0) return;
      
      const bookingIds = bookings.map(b => b.id);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('hiker_id', userId)
        .eq('review_type', 'hiker_to_guide')
        .in('booking_id', bookingIds);
      
      if (!error && data) {
        setReviews(data);
      }
    };
    
    fetchReviews();
  }, [userId, bookings]);

  const upcomingTrips = bookings
    .filter(booking => ['confirmed', 'pending', 'pending_confirmation'].includes(booking.status.toLowerCase()))
    .map(booking => ({
      id: booking.id,
      title: booking.tours?.title || 'Tour',
      dates: format(new Date(booking.booking_date), 'MMMM d, yyyy'),
      guide: { 
        name: booking.tours?.guide_profiles?.display_name || 'Guide', 
        avatar: booking.tours?.guide_profiles?.profile_image_url || '' 
      },
      location: booking.tours?.meeting_point || 'TBD',
      meeting_point_lat: booking.tours?.meeting_point_lat,
      meeting_point_lng: booking.tours?.meeting_point_lng,
      itinerary: booking.tours?.itinerary,
      guests: booking.participants,
      difficulty: booking.tours?.difficulty || 'Intermediate',
      tourId: booking.tour_id,
      guideId: booking.tours?.guide_id,
      status: booking.status,
      duration: booking.tours?.duration_days,
      image: booking.tours?.thumbnail_image,
      reviewSubmitted: reviews.some(r => r.booking_id === booking.id),
      booking_date: booking.booking_date,
    }))
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());

  const pastTrips = bookings
    .filter(booking => booking.status.toLowerCase() === 'completed')
    .map(booking => ({
      id: booking.id,
      title: booking.tours?.title || 'Tour',
      dates: format(new Date(booking.booking_date), 'MMMM d, yyyy'),
      guide: { 
        name: booking.tours?.guide_profiles?.display_name || 'Guide', 
        avatar: booking.tours?.guide_profiles?.profile_image_url || '' 
      },
      location: booking.tours?.meeting_point || 'Location',
      guests: booking.participants,
      difficulty: booking.tours?.difficulty || 'Intermediate',
      tourId: booking.tour_id,
      guideId: booking.tours?.guide_id,
      status: booking.status,
      duration: booking.tours?.duration_days,
      image: booking.tours?.thumbnail_image,
      reviewSubmitted: reviews.some(r => r.booking_id === booking.id),
      booking_date: booking.booking_date,
    }))
    .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

  const savedToursData = savedTours.map(saved => ({
    id: saved.tour_id,
    title: saved.tours?.title || 'Tour',
    location: saved.tours?.region || 'Location',
    price: saved.tours?.price_per_person || 0,
    currency: saved.tours?.currency || 'EUR',
    image: saved.tours?.thumbnail_image || '/placeholder.svg',
    difficulty: saved.tours?.difficulty || 'Intermediate',
    duration: saved.tours?.duration_days || 1,
    guide: saved.tours?.guide_profiles?.display_name || 'Guide',
  }));

  const savedGuidesData = followedGuides.map(follow => ({
    id: follow.guide_id,
    name: follow.guide_profiles?.display_name || 'Guide',
    avatar: follow.guide_profiles?.profile_image_url || '/placeholder.svg',
    location: follow.guide_profiles?.location || 'Location',
    bio: follow.guide_profiles?.bio || '',
    specialties: follow.guide_profiles?.specialties || [],
    dailyRate: follow.guide_profiles?.day_rate_solo,
    dailyRateCurrency: follow.guide_profiles?.day_rate_currency || 'EUR',
    slug: follow.guide_profiles?.slug || '',
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
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
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p>Error loading trips: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif mb-2">My Trips & Favorites</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Current & Upcoming Trips</TabsTrigger>
          <TabsTrigger value="past">Past Trips</TabsTrigger>
          <TabsTrigger value="wishlist">Trip Wishlist</TabsTrigger>
          <TabsTrigger value="guides">Saved Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingTrips.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-charcoal/30" />
              <p className="text-lg text-charcoal/60 mb-2">No upcoming trips yet</p>
              <p className="text-sm text-charcoal/40 mb-4">Start planning your next adventure</p>
              <Button onClick={() => navigate('/tours')}>Browse Tours</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTrips.map((trip) => (
                <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img src={trip.image || '/placeholder.svg'} alt={trip.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-2/3 flex flex-col">
                      <CardContent className="p-6 flex-1">
                        <h3 className="font-bold text-xl mb-2">{trip.title}</h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-charcoal/70">
                            <Calendar className="w-4 h-4" />
                            <span>{trip.dates}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-charcoal/70">
                            <MapPin className="w-4 h-4" />
                            <span>{trip.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-charcoal/70">
                            <Users className="w-4 h-4" />
                            <span>{trip.guests} {trip.guests === 1 ? 'guest' : 'guests'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={trip.guide.avatar} />
                            <AvatarFallback>{trip.guide.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{trip.guide.name}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setItineraryModal({ isOpen: true, trip })}
                          >
                            View Itinerary
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreparationModal({ isOpen: true, trip })}
                          >
                            Trip Preparation
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMessageModal({ isOpen: true, trip })}
                          >
                            💬 Message Guide
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMeetingPointModal({ isOpen: true, trip })}
                          >
                            Meeting Point
                          </Button>
                        </div>
                        
                        <Button
                          className="w-full mt-3 bg-burgundy hover:bg-burgundy/90"
                          onClick={() => navigate(`/dashboard/trip/${trip.id}`)}
                        >
                          View Complete Tour Details
                        </Button>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastTrips.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-charcoal/30" />
              <p className="text-lg text-charcoal/60 mb-2">No completed trips yet</p>
              <p className="text-sm text-charcoal/40">Your adventure history will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastTrips.map((trip) => (
                <Card key={trip.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img src={trip.image || '/placeholder.svg'} alt={trip.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-2/3 flex flex-col">
                      <CardContent className="p-6 flex-1">
                        <h3 className="font-bold text-xl mb-2">{trip.title}</h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-charcoal/70">
                            <Calendar className="w-4 h-4" />
                            <span>{trip.dates}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-charcoal/70">
                            <MapPin className="w-4 h-4" />
                            <span>{trip.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={trip.guide.avatar} />
                            <AvatarFallback>{trip.guide.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{trip.guide.name}</span>
                        </div>

                        {trip.reviewSubmitted ? (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Review submitted</span>
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => navigate(`/dashboard/trip/${trip.id}?tab=review`)}
                          >
                            Write a Review
                          </Button>
                        )}
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          {loadingSavedTours ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : savedToursData.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-charcoal/30" />
              <p className="text-lg text-charcoal/60 mb-2">No saved tours yet</p>
              <p className="text-sm text-charcoal/40 mb-4">Save tours you're interested in to view them later</p>
              <Button onClick={() => navigate('/tours')}>Browse Tours</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedToursData.map((tour) => (
                <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg">{tour.title}</h3>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => toggleSaveTour(tour.id)}
                      >
                        <Heart className="w-4 h-4 fill-burgundy text-burgundy" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-charcoal/70">
                        <MapPin className="w-4 h-4" />
                        <span>{tour.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-charcoal/70">
                        <Clock className="w-4 h-4" />
                        <span>{tour.duration} {tour.duration === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">{tour.difficulty}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-lg font-bold text-primary">
                        {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                      </span>
                      <Button onClick={() => navigate(`/tour/${tour.id}`)}>View Tour</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="guides" className="mt-6">
          {loadingFollowedGuides ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6 space-y-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : savedGuidesData.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-charcoal/30" />
              <p className="text-lg text-charcoal/60 mb-2">Not following any guides yet</p>
              <p className="text-sm text-charcoal/40 mb-4">Discover expert mountain guides and follow your favorites</p>
              <Button onClick={() => navigate('/guides')}>Browse Guides</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedGuidesData.map((guide) => (
                <Card key={guide.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={guide.avatar || '/placeholder.svg'} 
                      alt={guide.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={guide.avatar || ''} />
                          <AvatarFallback className="bg-primary text-white">
                            {guide.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{guide.name}</h3>
                          {guide.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{guide.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => toggleFollowGuide(guide.id)}
                      >
                        <Heart className="w-4 h-4 fill-burgundy text-burgundy" />
                      </Button>
                    </div>

                    {guide.bio && (
                      <p className="text-sm text-charcoal/70 mb-4 line-clamp-2">{guide.bio}</p>
                    )}

                    {guide.specialties && guide.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {guide.specialties.slice(0, 3).map((specialty, idx) => (
                          <Badge key={idx} variant="secondary">{specialty}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      {guide.dailyRate && (
                        <span className="text-lg font-bold text-primary">
                          {guide.dailyRateCurrency === 'EUR' ? '€' : '£'}{guide.dailyRate}/day
                        </span>
                      )}
                      <Button onClick={() => navigate(`/${guide.slug}`)}>View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Itinerary Modal */}
      <Dialog open={itineraryModal.isOpen} onOpenChange={() => {
        setItineraryModal({ isOpen: false, trip: null });
        setExpandedDay(1);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-charcoal">Trip Itinerary</DialogTitle>
            <DialogDescription className="text-charcoal/70">{itineraryModal.trip?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              // Handle itinerary data - it might be stored in different formats
              if (!itineraryModal.trip?.itinerary) {
                return <p>No itinerary available.</p>;
              }
              if (Array.isArray(itineraryModal.trip.itinerary)) {
                return itineraryModal.trip.itinerary.map((day: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <button
                      className="flex justify-between w-full text-left font-semibold"
                      onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                    >
                      <span>Day {index + 1}</span>
                      {expandedDay === index ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedDay === index && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {day.activities?.map((activity: string, idx: number) => (
                          <p key={idx}>- {activity}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ));
              }
              if (typeof itineraryModal.trip.itinerary === 'string') {
                return <p>{itineraryModal.trip.itinerary}</p>;
              }
              return <p>Itinerary format not recognized.</p>;
            })()}
            <Button
              className="w-full mt-4 bg-burgundy hover:bg-burgundy/90"
              onClick={() => {
                navigate(`/dashboard/trip/${itineraryModal.trip?.id}`);
              }}
            >
              View Full Trip Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trip Preparation Modal */}
      <Dialog open={preparationModal.isOpen} onOpenChange={() => setPreparationModal({ isOpen: false, trip: null })}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trip Preparation</DialogTitle>
            <DialogDescription>{preparationModal.trip?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete your pre-trip checklist, upload required documents, and prepare for your adventure.
            </p>
            <Button 
              className="w-full bg-[#7c2843] hover:bg-[#5d1e32]"
              onClick={() => {
                setPreparationModal({ isOpen: false, trip: null });
                navigate(`/dashboard/trip/${preparationModal.trip?.id}`);
              }}
            >
              Go to Preparation Checklist
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Guide Modal */}
      <Dialog open={messageModal.isOpen} onOpenChange={() => {
        setMessageModal({ isOpen: false, trip: null });
        setMessageText('');
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Message {messageModal.trip?.guide.name}</DialogTitle>
            <DialogDescription>
              Send a message about your trip: {messageModal.trip?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end">
              <Button
                disabled={sendingMessage || !messageText.trim()}
                onClick={async () => {
                  if (!messageText.trim() || !messageModal.trip) return;

                  setSendingMessage(true);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error('Not authenticated');

                    // Find or create conversation for this specific booking
                    let conversationId: string;
                    
                    const { data: existingConv } = await supabase
                      .from('conversations')
                      .select('id')
                      .eq('hiker_id', user.id)
                      .eq('guide_id', messageModal.trip.guideId)
                      .eq('booking_id', messageModal.trip.id)
                      .maybeSingle();

                    if (existingConv) {
                      conversationId = existingConv.id;
                    } else {
                      const { data: newConv, error: convError } = await supabase
                        .from('conversations')
                        .insert({
                          hiker_id: user.id,
                          guide_id: messageModal.trip.guideId,
                          tour_id: messageModal.trip.tourId,
                          booking_id: messageModal.trip.id,
                          conversation_type: 'booking_related'
                        })
                        .select('id')
                        .single();

                      if (convError) throw convError;
                      conversationId = newConv.id;
                    }

                    // Send message with correct parameters
                    const { error: sendError } = await supabase.functions.invoke('send-message', {
                      body: {
                        conversationId,
                        content: messageText.trim(),
                        senderType: 'hiker'
                      }
                    });

                    if (sendError) throw sendError;

                    toast({
                      title: 'Message sent',
                      description: `Your message has been sent to ${messageModal.trip.guide.name}.`,
                    });

                    setMessageText('');
                    setMessageModal({ isOpen: false, trip: null });
                  } catch (error) {
                    console.error('Error sending message:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to send message. Please try again.',
                      variant: 'destructive',
                    });
                  } finally {
                    setSendingMessage(false);
                  }
                }}
                className="bg-[#7c2843] hover:bg-[#5d1e32]"
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meeting Point Modal */}
      <Dialog open={meetingPointModal.isOpen} onOpenChange={() => setMeetingPointModal({ isOpen: false, trip: null })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-playfair text-charcoal">Meeting Point</DialogTitle>
            <DialogDescription className="text-charcoal/70">{meetingPointModal.trip?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Map */}
            {meetingPointModal.trip?.meeting_point_lat && meetingPointModal.trip?.meeting_point_lng ? (
              <div className="rounded-lg overflow-hidden border border-burgundy/10">
                <HikingLocationMap
                  latitude={meetingPointModal.trip.meeting_point_lat}
                  longitude={meetingPointModal.trip.meeting_point_lng}
                  title={meetingPointModal.trip.location}
                  height="300px"
                  zoom={14}
                  showControls={true}
                />
              </div>
            ) : (
              <div className="aspect-video bg-cream rounded-lg flex items-center justify-center border border-burgundy/10">
                <MapPin className="w-16 h-16 text-burgundy/30" />
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-cream rounded-lg">
                <MapPin className="w-5 h-5 text-burgundy mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-charcoal">Location</p>
                  <p className="text-sm text-charcoal/70">{meetingPointModal.trip?.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-cream rounded-lg">
                <Clock className="w-5 h-5 text-burgundy mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-charcoal">Date & Time</p>
                  <p className="text-sm text-charcoal/70">{meetingPointModal.trip?.dates}</p>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
              onClick={() => {
                setMeetingPointModal({ isOpen: false, trip: null });
                navigate(`/dashboard/trip/${meetingPointModal.trip?.id}`);
              }}
            >
              View Full Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
