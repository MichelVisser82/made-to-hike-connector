import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CertificationBadge } from '@/components/ui/certification-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Clock, Star, Heart, Eye, MessageCircle, CheckCircle, AlertTriangle, RefreshCw, FileText, Route, ChevronDown, ChevronUp, Camera, Trash2, Award } from 'lucide-react';
import { useHikerBookings } from '@/hooks/useHikerBookings';
import { useSavedTours } from '@/hooks/useSavedTours';
import { useFollowedGuides } from '@/hooks/useFollowedGuides';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
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
  const { fetchImages, getImageUrl } = useWebsiteImages();
  const [reviews, setReviews] = useState<any[]>([]);
  const [guideHeroImages, setGuideHeroImages] = useState<Record<string, string>>({});
  
  // Modal states
  const [itineraryModal, setItineraryModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [preparationModal, setPreparationModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [guideMessageModal, setGuideMessageModal] = useState<{ isOpen: boolean; guide: any | null }>({ isOpen: false, guide: null });
  const [meetingPointModal, setMeetingPointModal] = useState<{ isOpen: boolean; trip: any | null }>({ isOpen: false, trip: null });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [guideMessageText, setGuideMessageText] = useState('');
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

  // Fetch fallback hero images for guides without hero_background_url
  useEffect(() => {
    const loadGuideHeroImages = async () => {
      if (!followedGuides || followedGuides.length === 0) return;
      
      const newHeroImages: Record<string, string> = {};
      
      for (const follow of followedGuides) {
        const guide = follow.guide_profiles as any;
        if (guide && !guide.hero_background_url) {
          const guideImages = await fetchImages({ guide_id: follow.guide_id });
          
          if (guideImages && guideImages.length > 0) {
            const heroImages = guideImages.filter(img => 
              img.category === 'hero' || img.usage_context?.includes('hero')
            );
            const landscapeImages = guideImages.filter(img => 
              img.category === 'landscape' || img.usage_context?.includes('landscape')
            );
            
            const imageToUse = heroImages[0] || landscapeImages[0] || guideImages[0];
            const imageUrl = getImageUrl(imageToUse);
            newHeroImages[follow.guide_id] = imageUrl;
          }
        }
      }
      
      setGuideHeroImages(newHeroImages);
    };
    
    loadGuideHeroImages();
  }, [followedGuides, fetchImages, getImageUrl]);

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
      duration: booking.tours?.duration,
      image: booking.tours?.hero_image,
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
      duration: booking.tours?.duration,
      image: booking.tours?.hero_image,
      reviewSubmitted: reviews.some(r => r.booking_id === booking.id),
      booking_date: booking.booking_date,
    }))
    .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

  const savedToursData = savedTours.map(saved => ({
    id: saved.tour_id,
    slug: (saved.tours as any)?.slug || '',
    title: (saved.tours as any)?.title || 'Tour',
    location: (saved.tours as any)?.region || 'Location',
    price: (saved.tours as any)?.price || 0,
    currency: (saved.tours as any)?.currency || 'EUR',
    image: (saved.tours as any)?.hero_image || (saved.tours as any)?.images?.[0] || '/placeholder.svg',
    difficulty: (saved.tours as any)?.difficulty || 'Intermediate',
    duration: (saved.tours as any)?.duration || '1',
    guide: (saved.tours as any)?.guide_display_name || 'Guide',
    guideName: (saved.tours as any)?.guide_display_name || 'Guide',
    rating: (saved.tours as any)?.rating || 0,
    reviewsCount: (saved.tours as any)?.reviews_count || 0,
  }));

  const savedGuidesData = followedGuides.map(follow => ({
    id: follow.guide_id,
    name: follow.guide_profiles?.display_name || 'Guide',
    avatar: follow.guide_profiles?.profile_image_url || '/placeholder.svg',
    heroImage: (follow.guide_profiles as any)?.hero_background_url || guideHeroImages[follow.guide_id] || follow.guide_profiles?.profile_image_url || '/placeholder.svg',
    location: follow.guide_profiles?.location || 'Location',
    bio: follow.guide_profiles?.bio || '',
    specialties: follow.guide_profiles?.specialties || [],
    certifications: follow.guide_profiles?.certifications?.map((c: any) => {
      // If it's a string, convert to certification object
      if (typeof c === 'string') {
        return { title: c, certifyingBody: '', certificationType: 'custom' as const };
      }
      // If it's already an object, ensure it has required fields
      return {
        title: c?.title || c?.name || c?.type || 'Certification',
        certifyingBody: c?.certifyingBody || c?.certifying_body || '',
        certificationType: c?.certificationType || 'custom' as const,
        ...c
      };
    }) || [],
    dailyRate: follow.guide_profiles?.daily_rate,
    dailyRateCurrency: follow.guide_profiles?.daily_rate_currency || 'EUR',
    slug: follow.guide_profiles?.slug || '',
    rating: (follow.guide_profiles as any)?.average_rating || 4.9,
    reviewCount: (follow.guide_profiles as any)?.review_count || 0,
    tourCount: (follow.guide_profiles as any)?.tour_count || 0,
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
              <p>Error loading trips: {String(error)}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedToursData.map((tour) => (
                <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow relative group">
                  {/* Heart Button - Top Right */}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => toggleSaveTour(tour.id)}
                  >
                    <Heart className="w-4 h-4 fill-burgundy text-burgundy" />
                  </Button>

                  {/* Tour Image */}
                  <div className="relative aspect-[3/4]">
                    <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{tour.title}</h3>
                    
                    <div className="flex items-center gap-1.5 text-sm text-charcoal/70 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>{tour.location}</span>
                    </div>
                    
                    <p className="text-sm text-charcoal/70 mb-2">
                      with {tour.guideName}
                    </p>

                    {/* Rating */}
                    {tour.rating > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {tour.rating.toFixed(1)}
                        </span>
                        {tour.reviewsCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({tour.reviewsCount})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-lg font-bold text-burgundy">
                        {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                      </span>
                      <Button 
                        className="bg-burgundy hover:bg-burgundy/90 text-white"
                        onClick={() => navigate(`/tours/${tour.slug}`)}
                      >
                        View Tour
                      </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedGuidesData.map((guide) => (
                <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-shadow relative group">
                  {/* Heart Button - Top Right */}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => toggleFollowGuide(guide.id)}
                  >
                    <Heart className="w-4 h-4 fill-burgundy text-burgundy" />
                  </Button>

                  {/* Hero Image with Avatar Overlay */}
                  <div className="relative aspect-[3/4]">
                    <img 
                      src={guide.heroImage || guide.avatar || '/placeholder.svg'} 
                      alt={guide.name} 
                      className="w-full h-full object-cover" 
                    />
                    {/* Avatar - Bottom Left Overlay */}
                    <div className="absolute bottom-3 left-3">
                      <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                        <AvatarImage src={guide.avatar || ''} />
                        <AvatarFallback className="bg-burgundy text-white text-lg font-semibold">
                          {guide.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{guide.name}</h3>
                    
                    {guide.location && (
                      <div className="flex items-center gap-1.5 text-sm text-charcoal/70 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{guide.location}</span>
                      </div>
                    )}

                    {/* Rating and Tour Count - Only show if there's real data */}
                    {(guide.reviewCount > 0 || guide.tourCount > 0) && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {guide.rating?.toFixed(1) || '5.0'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({guide.reviewCount || 0})
                        </span>
                        <span className="text-sm text-charcoal/70 ml-2">
                          {guide.tourCount || 0} tours
                        </span>
                      </div>
                    )}

                    {/* Specialties */}
                    {guide.specialties && guide.specialties.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-charcoal/60 mb-1.5">Specialties</p>
                        <div className="flex flex-wrap gap-1.5">
                          {guide.specialties.slice(0, 3).map((specialty, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-burgundy/30 text-burgundy">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {guide.certifications && guide.certifications.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-charcoal/60 mb-1.5">Certifications</p>
                        <div className="flex flex-wrap gap-1.5">
                          {guide.certifications.slice(0, 2).map((cert, idx) => (
                            <CertificationBadge
                              key={idx}
                              certification={cert}
                              displayMode="simple"
                              showTooltip={true}
                              size="compact"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Button 
                        className="flex-1 bg-burgundy hover:bg-burgundy/90 text-white"
                        onClick={() => navigate(`/${guide.slug}`)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-burgundy text-burgundy hover:bg-burgundy/10"
                        onClick={() => setGuideMessageModal({ isOpen: true, guide })}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
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

      {/* Guide Message Modal */}
      <Dialog open={guideMessageModal.isOpen} onOpenChange={() => setGuideMessageModal({ isOpen: false, guide: null })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-playfair text-charcoal">Message Guide</DialogTitle>
            <DialogDescription className="text-charcoal/70">
              Send a message to {guideMessageModal.guide?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={guideMessageText}
              onChange={(e) => setGuideMessageText(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end">
              <Button
                disabled={sendingMessage || !guideMessageText.trim()}
                onClick={async () => {
                  if (!guideMessageText.trim() || !guideMessageModal.guide) return;

                  setSendingMessage(true);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error('Not authenticated');

                    // Find or create conversation with this guide
                    let conversationId: string;
                    
                    const { data: existingConv } = await supabase
                      .from('conversations')
                      .select('id')
                      .eq('hiker_id', user.id)
                      .eq('guide_id', guideMessageModal.guide.id)
                      .is('booking_id', null)
                      .maybeSingle();

                    if (existingConv) {
                      conversationId = existingConv.id;
                    } else {
                      const { data: newConv, error: convError } = await supabase
                        .from('conversations')
                        .insert({
                          hiker_id: user.id,
                          guide_id: guideMessageModal.guide.id,
                          conversation_type: 'general'
                        })
                        .select('id')
                        .single();

                      if (convError) throw convError;
                      conversationId = newConv.id;
                    }

                    // Send message
                    const { error: sendError } = await supabase.functions.invoke('send-message', {
                      body: {
                        conversationId,
                        content: guideMessageText.trim(),
                        senderType: 'hiker'
                      }
                    });

                    if (sendError) throw sendError;

                    toast({
                      title: 'Message sent',
                      description: `Your message has been sent to ${guideMessageModal.guide.name}.`,
                    });

                    setGuideMessageText('');
                    setGuideMessageModal({ isOpen: false, guide: null });
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
                className="bg-burgundy hover:bg-burgundy/90 text-white"
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
