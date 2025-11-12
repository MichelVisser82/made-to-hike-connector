import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Clock, Star, Heart, Eye, MessageCircle, CheckCircle, AlertTriangle, RefreshCw, FileText, Route } from 'lucide-react';
import { useHikerBookings } from '@/hooks/useHikerBookings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, isBefore } from 'date-fns';

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
  
  // Modal states
  const [itineraryModal, setItineraryModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [preparationModal, setPreparationModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [meetingPointModal, setMeetingPointModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Filter and transform bookings into upcoming trips
  const upcomingTrips = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      const isUpcoming = isAfter(bookingDate, new Date());
      const isActive = ['confirmed', 'pending', 'pending_confirmation'].includes(booking.status.toLowerCase());
      return isUpcoming && isActive;
    })
    .map(booking => ({
      id: booking.id,
      title: booking.tours?.title || 'Tour',
      dates: format(new Date(booking.booking_date), 'MMMM d, yyyy'),
      guide: { 
        name: booking.tours?.guide_profiles?.display_name || 'Guide', 
        avatar: booking.tours?.guide_profiles?.profile_image_url || '' 
      },
      location: booking.tours?.meeting_point || 'TBD',
      guests: booking.participants,
      difficulty: booking.tours?.difficulty || 'Intermediate',
      duration: booking.tours?.duration || '1 day',
      status: booking.status.toLowerCase(),
      image: booking.tours?.hero_image || (booking.tours?.images && booking.tours.images[0]) || '',
      tourId: booking.tour_id,
      tourSlug: booking.tours?.slug || '',
      guideId: booking.tours?.guide_id,
      price: booking.total_price,
      currency: booking.currency,
      specialRequests: booking.special_requests,
      paymentStatus: booking.payment_status
    }));

  // Filter and transform bookings into past trips
  const pastTrips = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      const isPast = isBefore(bookingDate, new Date());
      const isCompleted = booking.status.toLowerCase() === 'completed';
      return isPast || isCompleted;
    })
    .map(booking => ({
      id: booking.id,
      title: booking.tours?.title || 'Tour',
      dates: format(new Date(booking.booking_date), 'MMMM d, yyyy'),
      guide: { 
        name: booking.tours?.guide_profiles?.display_name || 'Guide', 
        avatar: booking.tours?.guide_profiles?.profile_image_url || '' 
      },
      location: booking.tours?.meeting_point || 'TBD',
      rating: 0, // TODO: Get from reviews
      image: booking.tours?.hero_image || (booking.tours?.images && booking.tours.images[0]) || '',
      reviewPending: true, // TODO: Check if review exists
      tourId: booking.tour_id,
      tourSlug: booking.tours?.slug || '',
      guideId: booking.tours?.guide_id
    }));

  // TODO: Implement wishlist and saved guides from database
  const wishlist: any[] = [];
  const savedGuides: any[] = [];

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !messageModal.trip) return;

    setSendingMessage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: sendError } = await supabase.functions.invoke('send-message', {
        body: {
          recipient_id: messageModal.trip.guideId,
          message: messageText.trim(),
          sender_type: 'hiker',
          tour_id: messageModal.trip.tourId
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
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif mb-2">My Trips & Favorites</h1>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
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
          <h1 className="text-3xl font-serif mb-2">My Trips & Favorites</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load trips. Please try again.</p>
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
          <TabsTrigger value="upcoming">Upcoming Trips</TabsTrigger>
          <TabsTrigger value="past">Past Trips</TabsTrigger>
          <TabsTrigger value="wishlist">Trip Wishlist</TabsTrigger>
          <TabsTrigger value="guides">Saved Guides</TabsTrigger>
        </TabsList>

        {/* Upcoming Trips */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTrips.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Trips</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any upcoming adventures yet.
                </p>
                <Button onClick={() => navigate('/tours')}>
                  Browse Tours
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">{upcomingTrips.length} {upcomingTrips.length === 1 ? 'trip' : 'trips'}</Badge>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar View
                </Button>
              </div>

              {upcomingTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Image Section - 1/3 width */}
                  <div className="relative h-64 md:h-full">
                    {trip.image && (
                      <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
                    )}
                    {/* Status Badge Overlay */}
                    <Badge 
                      className={`absolute top-4 left-4 ${
                        trip.status === 'confirmed' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                      }`}
                    >
                      {trip.status === 'confirmed' ? 'Confirmed' : 'Action Needed'}
                    </Badge>
                  </div>

                  {/* Content Section - 2/3 width */}
                  <div className="md:col-span-2 p-6 space-y-4">
                    {/* Title & Date */}
                    <div>
                      <h3 className="text-2xl font-serif font-semibold mb-1">{trip.title}</h3>
                      <p className="text-muted-foreground">{trip.dates}</p>
                    </div>

                    {/* Guide & Tour Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          {trip.guide.avatar && <AvatarImage src={trip.guide.avatar} />}
                          <AvatarFallback>
                            {trip.guide.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium">{trip.guide.name}</p>
                          <p className="text-muted-foreground text-xs">Your Guide</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{trip.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{trip.guests} {trip.guests === 1 ? 'Guest' : 'Guests'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{trip.duration}</span>
                      </div>
                    </div>

                    {/* Alert Banners */}
                    {trip.paymentStatus.toLowerCase() === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900">Payment Pending</p>
                          <p className="text-sm text-yellow-700">Complete your payment to confirm booking</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons - Stacked Vertically */}
                    <div className="space-y-2 pt-2">
                      <Button 
                        className="w-full bg-[#7c2843] hover:bg-[#5d1e32] text-white justify-start"
                        onClick={() => navigate(`/dashboard/trip/${trip.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Complete Tour Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setItineraryModal({ isOpen: true, trip })}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Itinerary
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setPreparationModal({ isOpen: true, trip })}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Trip Preparation
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setMessageModal({ isOpen: true, trip })}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message Guide
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setMeetingPointModal({ isOpen: true, trip })}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Meeting Point
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* Past Trips */}
        <TabsContent value="past" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button variant="outline">Most Recent ▼</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
                  {trip.reviewPending && (
                    <Badge className="absolute top-4 right-4 bg-orange-500">Review Pending</Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{trip.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{trip.dates}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{trip.guide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Guide: {trip.guide.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.location}</span>
                  </div>
                  {!trip.reviewPending && (
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < trip.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button 
                      variant={trip.reviewPending ? 'default' : 'outline'} 
                      className={trip.reviewPending ? 'w-full bg-[#7c2843] hover:bg-[#5d1e32]' : 'w-full'}
                      onClick={() => navigate(`/dashboard?section=reviews&bookingId=${trip.id}`)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {trip.reviewPending ? 'Write Review' : 'View Your Review'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-[#7c2843] text-[#7c2843] hover:bg-[#7c2843]/10"
                      onClick={() => trip.tourSlug && navigate(`/tours/${trip.tourSlug}`)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Book Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trip Wishlist */}
        <TabsContent value="wishlist" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif">Trip Wishlist</h2>
            <span className="text-muted-foreground">{wishlist.length} saved tours</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wishlist.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 bg-white/90 hover:bg-white">
                    <Heart className="w-4 h-4 fill-primary text-primary" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{tour.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{tour.location}</span>
                  </div>
                  <p className="text-sm mb-2">with {tour.guide}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{tour.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({tour.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">€{tour.price}</span>
                  </div>
                  <Button className="w-full mt-3">View Tour</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Saved Guides */}
        <TabsContent value="guides" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif">Saved Guides</h2>
            <span className="text-muted-foreground">{savedGuides.length} followed guides</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedGuides.map((guide) => (
              <Card key={guide.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-white">
                          {guide.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{guide.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{guide.location}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Heart className="w-4 h-4 fill-primary text-primary" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{guide.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({guide.tours} tours)</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="default">View Profile</Button>
                    <Button variant="outline">💬 Message</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Itinerary Modal */}
      <Dialog open={itineraryModal.isOpen} onOpenChange={() => setItineraryModal({ isOpen: false, trip: null })}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trip Itinerary</DialogTitle>
            <DialogDescription>{itineraryModal.trip?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View your complete day-by-day itinerary on the trip details page.
            </p>
            <Button 
              className="w-full bg-[#7c2843] hover:bg-[#5d1e32]"
              onClick={() => {
                setItineraryModal({ isOpen: false, trip: null });
                navigate(`/dashboard/trip/${itineraryModal.trip?.id}`);
              }}
            >
              View Full Itinerary
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
              rows={6}
              className="resize-none"
            />
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setMessageModal({ isOpen: false, trip: null });
                  setMessageText('');
                }}
                disabled={sendingMessage}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage} 
                disabled={sendingMessage || !messageText.trim()}
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
            <DialogTitle>Meeting Point</DialogTitle>
            <DialogDescription>{meetingPointModal.trip?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#7c2843] mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{meetingPointModal.trip?.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#7c2843] mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">{meetingPointModal.trip?.dates}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              View more details including exact coordinates and meeting instructions on the trip details page.
            </p>
            <Button 
              className="w-full bg-[#7c2843] hover:bg-[#5d1e32]"
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
