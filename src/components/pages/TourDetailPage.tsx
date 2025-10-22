import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Star, MapPin, Users, Clock, ArrowLeft, Calendar, Shield, CheckCircle, Heart, Share2, 
         Mountain, Navigation, Dumbbell, Activity, Route, Award, MessageCircle, ChevronDown, X, XCircle } from 'lucide-react';
import { SmartImage } from '../SmartImage';
import { type Tour } from '../../types';
import { useEnhancedGuideInfo } from '@/hooks/useEnhancedGuideInfo';
import { GuideInfoDisplay } from '../guide/GuideInfoDisplay';
import { CertificationBadge } from '../ui/certification-badge';
import { getPrimaryCertification } from '@/utils/guideDataUtils';
import { AnonymousChat } from '../chat/AnonymousChat';
import { useTourDateAvailability } from '@/hooks/useTourDateAvailability';
import { useTourMapData } from '@/hooks/useTourMapData';
import { format, addDays, parse } from 'date-fns';
import { HikingLocationMap } from '../tour/HikingLocationMap';
import { PublicTourMapSection } from '../tour/PublicTourMapSection';

interface TourDetailPageProps {
  tour: Tour;
  onBookTour: (tour: Tour) => void;
  onBackToSearch: () => void;
}

export function TourDetailPage({ tour, onBookTour, onBackToSearch }: TourDetailPageProps) {
  const [expandedItinerary, setExpandedItinerary] = useState<Record<number, boolean>>({});
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  
  // Use unified hook for consistent guide data
  const { guideInfo, isLoadingProfessional, guideProfile } = useEnhancedGuideInfo(tour);
  
  // Get primary certification for large badge display
  const primaryCert = guideProfile?.certifications ? getPrimaryCertification(guideProfile.certifications) : null;

  // Fetch real date availability
  const { data: dateSlots, isLoading: isLoadingDates } = useTourDateAvailability(tour.id);
  
  // Fetch tour map data (if exists)
  const { data: tourMapData } = useTourMapData(tour.id);

  // Helper to format date range based on tour duration
  const formatDateRange = (startDate: Date, duration: string) => {
    const durationMatch = duration.match(/(\d+)/);
    const days = durationMatch ? parseInt(durationMatch[0]) : 1;
    const endDate = addDays(startDate, days - 1);
    return `${format(startDate, 'MMM d')}${days > 1 ? `-${format(endDate, 'd')}` : ''}`;
  };

  // Transform real data to match UI format
  const dateOptions = dateSlots?.map(slot => {
    const originalPrice = slot.discountPercentage 
      ? slot.price / (1 - slot.discountPercentage / 100) 
      : null;
    const savings = originalPrice ? originalPrice - slot.price : null;
    
    return {
      date: slot.slotDate.toISOString().split('T')[0],
      dateRange: formatDateRange(slot.slotDate, tour.duration),
      price: slot.price,
      originalPrice,
      discount: slot.discountLabel || (slot.isEarlyBird ? 'Early Bird' : null),
      spotsLeft: slot.spotsRemaining,
      savings,
      slotId: slot.slotId
    };
  }) || [];

  const toggleItinerary = (index: number) => {
    setExpandedItinerary(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const selectedDateOption = dateOptions.find(d => d.date === selectedDate);
  
  // Calculate lowest available price from real data
  const lowestPrice = dateOptions.length > 0 
    ? Math.min(...dateOptions.map(d => d.price))
    : tour.price;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[600px] md:h-[700px]">
        <div className="absolute inset-0 overflow-hidden">
          {tour.hero_image ? (
            <img 
              src={tour.hero_image} 
              alt={`${tour.title} - Epic landscape view of ${tour.region}`}
              className="w-full h-full object-cover"
            />
          ) : tour.images[0] ? (
            <img 
              src={tour.images[0]} 
              alt={`${tour.title} - Tour view`}
              className="w-full h-full object-cover"
            />
          ) : (
            <SmartImage
              category="hero"
              usageContext={tour.region}
              tags={[tour.region, 'landscape', 'mountains', 'epic', 'wide']}
              className="w-full h-full object-cover"
              alt={`${tour.title} - Epic landscape view of ${tour.region}`}
              priority="high"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
        
      {/* Hero Content */}
      <div className="absolute inset-0">
        <div className="container mx-auto px-4 h-full flex flex-col">
          <Button
            variant="ghost"
            onClick={onBackToSearch}
            className="mt-4 text-white hover:bg-white/10 self-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          
          <div className="flex-1 flex items-center justify-start relative">
            <div className="max-w-xl mr-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-white/90 ml-1">{tour.rating}</span>
                </div>
                <span className="text-white/60">•</span>
                <span className="text-sm text-white/90">43 reviews</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{tour.title}</h1>
              <p className="text-lg text-white/90 mb-4">{tour.short_description}</p>
              
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="capitalize">{tour.region.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Max {tour.group_size}</span>
                </div>
              </div>
            </div>
            
            {/* Guide Profile & Booking Card in Hero */}
            <Card className="w-96 bg-white/95 backdrop-blur-sm absolute top-1/2 right-8 -translate-y-1/2">
              <CardHeader className="pb-3">
                <GuideInfoDisplay 
                  guideInfo={guideInfo}
                  isLoadingProfessional={isLoadingProfessional}
                  showBadge={true}
                  size="md"
                  certifications={guideProfile?.certifications}
                  isGuideVerified={guideProfile?.verified ?? false}
                  guideSlug={guideProfile?.slug}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Display */}
                <div className="text-center py-3 border-y">
                  <div className="text-sm text-muted-foreground mb-1">From</div>
                  <div className="text-3xl font-bold">
                    {tour.currency === 'EUR' ? '€' : '£'}{lowestPrice}
                    <span className="text-base font-normal text-muted-foreground"> / person</span>
                  </div>
                </div>
                
                {/* Date Selection Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Select a Date</label>
                  <button
                    type="button"
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="w-full px-4 py-3 border rounded-lg bg-background hover:border-primary transition-colors flex items-center justify-between text-left"
                  >
                    <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
                      {selectedDate 
                        ? dateOptions.find(d => d.date === selectedDate)?.dateRange 
                        : "Choose available dates"}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDateDropdown && (
                    <div className="absolute z-[100] w-full mt-2 bg-popover border rounded-lg shadow-lg max-h-80 overflow-auto">
                      {isLoadingDates ? (
                        <div className="p-4 text-center text-muted-foreground">Loading dates...</div>
                      ) : dateOptions.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No dates available</div>
                      ) : dateOptions.map((option) => (
                        <button
                          key={option.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(option.date);
                            setShowDateDropdown(false);
                          }}
                          className="w-full px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0 text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">{option.dateRange}</div>
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {option.spotsLeft} {option.spotsLeft === 1 ? 'spot' : 'spots'} left
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {option.discount && (
                                <Badge variant="secondary" className="mb-1 text-xs px-2 py-0">
                                  {option.discount}
                                </Badge>
                              )}
                              <div className="flex flex-col">
                                {option.originalPrice && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {tour.currency === 'EUR' ? '€' : '£'}{option.originalPrice}
                                  </span>
                                )}
                                <span className="font-bold text-base">
                                  {tour.currency === 'EUR' ? '€' : '£'}{option.price}
                                </span>
                                {option.savings && (
                                  <span className="text-xs text-green-600">
                                    Save {tour.currency === 'EUR' ? '€' : '£'}{option.savings}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Spots Indicator */}
                {selectedDateOption && (
                  <div className="bg-accent/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {selectedDateOption.spotsLeft} of {tour.group_size} spots available
                        </span>
                      </div>
                      {selectedDateOption.spotsLeft <= 3 && (
                        <Badge variant="destructive" className="text-xs">
                          Almost Full
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Summary */}
                {selectedDateOption && (
                  <div className="space-y-2 py-3 border-y">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tour price</span>
                      <span className="font-medium">
                        {tour.currency === 'EUR' ? '€' : '£'}{selectedDateOption.price}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>
                        {tour.currency === 'EUR' ? '€' : '£'}{selectedDateOption.price}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => onBookTour(tour)}
                    disabled={!selectedDate}
                    className="w-full h-11"
                    size="lg"
                  >
                    {selectedDate ? 'Book Now' : 'Select a Date to Book'}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full h-11"
                    size="lg"
                    onClick={() => setChatOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ask the Guide
                  </Button>
                  {selectedDate && (
                    <p className="text-xs text-center text-muted-foreground">You won't be charged yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* About This Tour Section */}
            <Card>
              <CardHeader>
                <CardTitle>About This Tour</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {tour.description}
                </p>
              </CardContent>
            </Card>

            {/* Tour Highlights & Meeting Location - Side by Side */}
            <div className="grid lg:grid-cols-2 gap-6 lg:items-stretch lg:min-h-[280px]">
              {/* Tour Highlights */}
              <Card className="shadow-lg lg:h-full lg:flex lg:flex-col">
                <CardHeader>
                  <CardTitle>Tour Highlights</CardTitle>
                </CardHeader>
                <CardContent className="lg:flex-1">
                  <div className="space-y-3">
                    {tour.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Mountain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{highlight}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Tour Map or Meeting Location */}
              {tourMapData ? (
                <PublicTourMapSection
                  mapSettings={tourMapData.mapSettings}
                  featuredHighlights={tourMapData.featuredHighlights}
                  meetingPoint={tour.meeting_point_lat && tour.meeting_point_lng ? {
                    lat: tour.meeting_point_lat,
                    lng: tour.meeting_point_lng
                  } : undefined}
                />
              ) : tour.meeting_point_lat && tour.meeting_point_lng && (
                <Card className="shadow-lg lg:h-full lg:flex lg:flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Meeting Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="lg:flex-1 lg:flex lg:flex-col">
                    <div className="lg:flex-1 min-h-[200px]">
                      <HikingLocationMap
                        latitude={tour.meeting_point_lat}
                        longitude={tour.meeting_point_lng}
                        title={tour.meeting_point_formatted || tour.meeting_point}
                        height="100%"
                        zoom={13}
                      />
                    </div>
                    <div className="mt-4 p-3 bg-accent/50 rounded-lg lg:flex-shrink-0">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium text-sm mb-1">Where We'll Meet</div>
                          <div className="text-xs text-muted-foreground">
                            {tour.meeting_point_formatted || tour.meeting_point}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Photo Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Tour Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1 aspect-video rounded-lg overflow-hidden">
                    <SmartImage
                      category="tour"
                      usageContext={tour.region}
                      tags={[tour.region, 'landscape', 'main', 'featured']}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      fallbackSrc={tour.images[0]}
                      alt={`${tour.title} - Featured landscape view`}
                    />
                  </div>
                  <div className="flex flex-col gap-3 w-32">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <SmartImage
                        category="tour"
                        usageContext={tour.region}
                        tags={[tour.region, 'trail', 'hiking']}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        fallbackSrc={tour.images[1] || tour.images[0]}
                        alt={`${tour.title} - Trail views`}
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <SmartImage
                        category="tour"
                        usageContext={tour.region}
                        tags={[tour.region, 'summit', 'peak']}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        fallbackSrc={tour.images[2] || tour.images[0]}
                        alt={`${tour.title} - Summit views`}
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <SmartImage
                        category="tour"
                        usageContext={tour.region}
                        tags={[tour.region, 'group', 'adventure']}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        fallbackSrc={tour.images[3] || tour.images[0]}
                        alt={`${tour.title} - Group adventures`}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  See all photos from this amazing adventure
                </p>
              </CardContent>
            </Card>


            {/* Fitness Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Fitness Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Grid with 4 requirement items */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-lg">Experience Needed</h4>
                    </div>
                    <p className="text-muted-foreground">Beginner-friendly with regular hiking experience</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-lg">Daily Activity</h4>
                    </div>
                    <p className="text-muted-foreground">{tour.daily_hours || '6-8 hours'} of hiking</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Mountain className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-lg">Pack Weight</h4>
                    </div>
                    <p className="text-muted-foreground">{tour.pack_weight || '10-15'}kg (gear rental available)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-lg">Terrain</h4>
                    </div>
                    <p className="text-muted-foreground">{tour.terrain_types?.join(', ') || 'Mountain trails, well-maintained paths'}</p>
                  </div>
                </div>

                {/* Difficulty Level Section */}
                <div className="space-y-6 pt-8 border-t">
                  <h4 className="font-semibold text-xl">Difficulty Level</h4>
                  
                  <div className="flex justify-center">
                    <Badge className="bg-red-900 hover:bg-red-900 text-white px-8 py-3 text-base font-semibold rounded-full">
                      {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
                    </Badge>
                  </div>

                  {/* Terrain Illustration */}
                  <div className="relative w-full h-64 bg-gradient-to-r from-sky-200 via-sky-100 to-slate-300 rounded-lg overflow-hidden">
                    {/* Sky elements */}
                    <div className="absolute top-8 left-20 w-20 h-12 bg-white rounded-full opacity-80" />
                    <div className="absolute top-12 right-32 w-16 h-10 bg-white rounded-full opacity-80" />
                    <div className="absolute top-6 right-12 w-12 h-8 bg-yellow-400 rounded-full" />
                    
                    {/* Terrain layers */}
                    <svg className="absolute bottom-0 w-full h-40" viewBox="0 0 1200 160" preserveAspectRatio="none">
                      {/* Flat terrain - A */}
                      <path d="M 0,120 L 300,120 L 300,160 L 0,160 Z" fill="#84cc16" />
                      {/* Rolling hills - B */}
                      <path d="M 300,120 Q 350,100 400,90 Q 450,80 500,85 Q 550,90 600,100 L 600,160 L 300,160 Z" fill="#a3e635" />
                      {/* Mountain - C */}
                      <path d="M 600,100 L 750,40 L 900,70 L 900,160 L 600,160 Z" fill="#92400e" />
                      {/* Alpine - D */}
                      <path d="M 900,70 L 1050,30 L 1200,50 L 1200,160 L 900,160 Z" fill="#64748b" />
                    </svg>
                    
                    {/* Trees on mountain */}
                    <div className="absolute bottom-16 left-[52%] flex gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-2 h-6 bg-green-800" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                      ))}
                    </div>

                    {/* Level markers */}
                    <div className="absolute bottom-24 left-[12%] w-10 h-10 bg-green-700 rounded-full border-4 border-white flex items-center justify-center text-white font-bold">A</div>
                    <div className="absolute bottom-32 left-[38%] w-10 h-10 bg-red-900 rounded-full border-4 border-white flex items-center justify-center text-white font-bold">B</div>
                    <div className="absolute bottom-36 left-[63%] w-10 h-10 bg-orange-700 rounded-full border-4 border-white flex items-center justify-center text-white font-bold">C</div>
                    <div className="absolute top-12 right-[8%] w-10 h-10 bg-red-900 rounded-full border-4 border-white flex items-center justify-center text-white font-bold">D</div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-muted-foreground">A - Easy</div>
                      <div className="text-muted-foreground">Flat terrain</div>
                    </div>
                    <div>
                      <div className="font-semibold text-red-900">B - Moderate</div>
                      <div className="text-muted-foreground">Rolling hills</div>
                    </div>
                    <div>
                      <div className="font-semibold text-muted-foreground">C - Challenging</div>
                      <div className="text-muted-foreground">Mountain trails</div>
                    </div>
                    <div>
                      <div className="font-semibold text-muted-foreground">D - Expert</div>
                      <div className="text-muted-foreground">Alpine terrain</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full Tour Route Map - Shows when map data exists */}
            {tourMapData && (
              <PublicTourMapSection
                mapSettings={tourMapData.mapSettings}
                featuredHighlights={tourMapData.featuredHighlights}
                meetingPoint={tour.meeting_point_lat && tour.meeting_point_lng ? {
                  lat: tour.meeting_point_lat,
                  lng: tour.meeting_point_lng
                } : undefined}
              />
            )}

            {/* Detailed Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(tour.itinerary && Array.isArray(tour.itinerary) && tour.itinerary.length > 0 ? tour.itinerary : [
                    {
                      day: 1,
                      title: "Meeting Point",
                      activities: ["Start your journey with a comprehensive safety briefing and professional equipment check at the trailhead"],
                      accommodation: null,
                      meals: null
                    }
                  ]).map((item: any, index: number) => (
                    <div key={index} className="group">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-64 w-full flex-shrink-0">
                          <div className="aspect-[3/2] rounded-lg overflow-hidden">
                            <SmartImage
                              category="tour"
                              usageContext={tour.region}
                              tags={[tour.region, 'hiking', 'trail']}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              fallbackSrc={tour.images[Math.min(index, tour.images.length - 1)]}
                              alt={item.title}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Day {item.day}</Badge>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                          </div>
                          <div className="space-y-2">
                            {item.activities?.map((activity: string, actIndex: number) => (
                              <p key={actIndex} className="text-sm text-muted-foreground leading-relaxed">
                                {expandedItinerary[index] 
                                  ? activity
                                  : actIndex === 0 ? (activity.length > 120 ? `${activity.substring(0, 120)}...` : activity) : null
                                }
                              </p>
                            ))}
                          </div>
                          
                          {item.activities && item.activities.length > 1 && (
                            <button
                              onClick={() => toggleItinerary(index)}
                              className="text-sm text-primary hover:underline mt-2 font-medium transition-colors"
                            >
                              {expandedItinerary[index] ? "Show less" : "Read more"}
                            </button>
                          )}
                          
                          {(item.accommodation || item.meals) && expandedItinerary[index] && (
                            <div className="mt-3 pt-3 border-t space-y-1">
                              {item.accommodation && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Accommodation:</span> {item.accommodation}
                                </p>
                              )}
                              {item.meals && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Meals:</span> {item.meals}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meet Your Guide */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Meet Your Guide</h2>
              
              <div className="bg-background border rounded-lg overflow-hidden">
                <div className="grid md:grid-cols-[400px,1fr] gap-0">
                  {/* Guide Image - Left Side */}
                  <div className="relative h-[500px]">
                    {guideInfo.avatarUrl ? (
                      <img 
                        src={guideInfo.avatarUrl} 
                        alt={`${guideInfo.displayName} - Professional hiking guide`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <SmartImage
                        category="guide"
                        usageContext="professional"
                        tags={['portrait', 'guide', 'professional', 'certified', 'hiking']}
                        className="w-full h-full object-cover"
                        alt="Professional hiking guide"
                      />
                    )}
                  </div>

                  {/* Guide Info - Right Side */}
                  <div className="p-8 flex flex-col">
                    {/* Name with Certification Badge */}
                    <div className="mb-4">
                      <h3 className="text-3xl font-bold mb-2">
                        {guideInfo.displayName}
                      </h3>
                      
                      {/* Location directly below name */}
                      {guideInfo.location && (
                        <p className="text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="h-4 w-4" />
                          {guideInfo.location}
                        </p>
                      )}
                      
                      {/* Large Certification Badge - Card Display Mode */}
                      {primaryCert && (
                        <CertificationBadge
                          certification={primaryCert}
                          displayMode="card"
                          showTooltip={false}
                          isGuideVerified={guideProfile?.verified ?? false}
                        />
                      )}
                      
                      {/* Additional Certifications - Small Badges */}
                      {guideProfile?.certifications && guideProfile.certifications.length > 1 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {guideProfile.certifications
                            .filter(cert => !cert.isPrimary)
                            .map((cert, index) => (
                              <CertificationBadge
                                key={index}
                                certification={cert}
                                size="mini"
                                showTooltip
                                isGuideVerified={guideProfile?.verified ?? false}
                              />
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {guideInfo.bio || `Professional mountain guide with extensive experience leading tours in ${tour.region.replace('-', ' ')}. Passionate about sharing the beauty and adventure of the mountains with hikers of all levels.`}
                    </p>

                    {/* Stats Section */}
                    <div className="space-y-3 mb-6 pb-6 border-b">
                      {guideInfo.toursCompleted > 0 && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{guideInfo.toursCompleted}+</span>
                          <span className="text-muted-foreground">Tours Led</span>
                        </div>
                      )}
                      {guideInfo.averageRating > 0 && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{guideInfo.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">Guide Rating</span>
                        </div>
                      )}
                      {guideInfo.experienceYears && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{guideInfo.experienceYears}+</span>
                          <span className="text-muted-foreground">Years Experience</span>
                        </div>
                      )}
                    </div>

                    {/* Guide Owned Badge */}
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                        <Shield className="h-5 w-5" />
                        <span className="font-semibold">Guide Owned</span>
                      </div>
                    </div>

                    {/* Profit Sharing Banner */}
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                      <p className="text-sm text-destructive font-medium">
                        100% of profits go directly to your guide - we only charge a small platform fee to cover costs
                      </p>
                    </div>

                    {/* Ask Question Button */}
                    <Button variant="default" size="lg" className="w-full">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Ask {guideInfo.displayName.split(' ')[0]} a question
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included / Not Included */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tour.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Not Included</CardTitle>
                </CardHeader>
                <CardContent>
                  {tour.excluded_items && tour.excluded_items.length > 0 ? (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {tour.excluded_items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">All standard items are included.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews & Testimonials - Bottom Section */}
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Reviews & Testimonials</h2>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span>{tour.rating} • {tour.reviews_count} reviews</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <Card className="bg-background">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm italic mb-4">
                      "An absolutely incredible experience! The views were breathtaking and our guide was knowledgeable and friendly."
                    </p>
                    <div className="flex items-center gap-3">
                      <SmartImage
                        category="guide"
                        usageContext="review"
                        tags={['person', 'profile', 'reviewer']}
                        className="w-8 h-8 rounded-full object-cover"
                        fallbackSrc="/placeholder-avatar.jpg"
                        alt="Reviewer profile"
                      />
                      <div>
                        <div className="text-sm font-medium">Sarah M.</div>
                        <div className="text-xs text-muted-foreground">March 2024</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-background">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm italic mb-4">
                      "Perfect for adventurers! Well organized, safe, and the scenery was beyond our expectations."
                    </p>
                    <div className="flex items-center gap-3">
                      <SmartImage
                        category="guide"
                        usageContext="review"
                        tags={['person', 'profile', 'reviewer']}
                        className="w-8 h-8 rounded-full object-cover"
                        fallbackSrc="/placeholder-avatar.jpg"
                        alt="Reviewer profile"
                      />
                      <div>
                        <div className="text-sm font-medium">James R.</div>
                        <div className="text-xs text-muted-foreground">February 2024</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-background">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm italic mb-4">
                      "Highly recommend! The guide's expertise made all the difference. Amazing photos and memories."
                    </p>
                    <div className="flex items-center gap-3">
                      <SmartImage
                        category="guide"
                        usageContext="review"
                        tags={['person', 'profile', 'reviewer']}
                        className="w-8 h-8 rounded-full object-cover"
                        fallbackSrc="/placeholder-avatar.jpg"
                        alt="Reviewer profile"
                      />
                      <div>
                        <div className="text-sm font-medium">Emma L.</div>
                        <div className="text-xs text-muted-foreground">January 2024</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Other Tours in the Area */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">Other Tours in the Area</h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[
                  {
                    id: '1',
                    title: 'Ben Nevis Summit Challenge',
                    guide_name: 'James Highland',
                    region: 'Scotland',
                    difficulty: 'challenging',
                    duration: '4 days',
                    group_size: 8,
                    price: Math.round(tour.price * 1.2),
                    rating: 4.8,
                    reviews_count: 127,
                    tags: ['summit', 'peak', 'mountain', 'challenge']
                  },
                  {
                    id: '2',
                    title: 'Loch Ness & Castle Tour',
                    guide_name: 'Emma Scott',
                    region: 'Scotland',
                    difficulty: 'easy',
                    duration: '2 days',
                    group_size: 10,
                    price: Math.round(tour.price * 0.8),
                    rating: 4.6,
                    reviews_count: 89,
                    tags: ['loch', 'castle', 'landscape', 'scenic']
                  },
                  {
                    id: '3',
                    title: 'Highland Glens Explorer',
                    guide_name: 'Sarah Mountain',
                    region: 'Scotland',
                    difficulty: 'moderate',
                    duration: '3 days',
                    group_size: 6,
                    price: Math.round(tour.price * 1.1),
                    rating: 4.9,
                    reviews_count: 45,
                    tags: ['glen', 'waterfall', 'hiking', 'nature']
                  }
                ].map((otherTour) => (
                  <Card key={otherTour.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="aspect-[4/5] relative overflow-hidden">
                      <SmartImage
                        category="tour"
                        usageContext="scottish-highlands"
                        tags={otherTour.tags}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop"
                        alt={`${otherTour.title} - Scottish Highlands hiking tour`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <Badge
                        className="absolute top-4 left-4 bg-white/90 text-foreground hover:bg-white"
                        variant="secondary"
                      >
                        {otherTour.difficulty}
                      </Badge>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary-foreground transition-colors">
                          {otherTour.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                          <SmartImage
                            category="guide"
                            usageContext="avatar"
                            tags={['portrait', 'guide', 'professional']}
                            className="w-5 h-5 rounded-full object-cover"
                            fallbackSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                            alt={`${otherTour.guide_name} - Professional hiking guide`}
                          />
                          <span>by {otherTour.guide_name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="space-y-3 text-sm mb-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{otherTour.region}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{otherTour.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span>Max {otherTour.group_size} people</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-accent fill-current" />
                          <span>{otherTour.rating} ({otherTour.reviews_count} reviews)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-primary">
                          £{otherTour.price}
                        </div>
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle booking
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Anonymous Chat Modal */}
      <AnonymousChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        tourId={tour.id}
        guideId={tour.guide_id}
        tourTitle={tour.title}
      />
    </div>
  );
}