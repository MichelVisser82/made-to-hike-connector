import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Star, MapPin, Users, Clock, ArrowLeft, Calendar, Shield, CheckCircle, Heart, Share2, 
         Mountain, Navigation, Dumbbell, Activity, Route } from 'lucide-react';
import { SmartImage } from '../SmartImage';
import { type Tour } from '../../types';

interface TourDetailPageProps {
  tour: Tour;
  onBookTour: (tour: Tour) => void;
  onBackToSearch: () => void;
}

export function TourDetailPage({ tour, onBookTour, onBackToSearch }: TourDetailPageProps) {
  const [expandedItinerary, setExpandedItinerary] = useState<Record<number, boolean>>({});

  const toggleItinerary = (index: number) => {
    setExpandedItinerary(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <SmartImage
          category="hero"
          usageContext={tour.region}
          tags={[tour.region, 'landscape', 'mountains', 'epic', 'wide']}
          className="w-full h-full object-cover"
          fallbackSrc={tour.images[0]}
          alt={`${tour.title} - Epic landscape view of ${tour.region}`}
          priority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
      {/* Hero Content */}
      <div className="absolute inset-0">
        <div className="container mx-auto px-4 h-full flex flex-col">
          <Button
            variant="ghost"
            onClick={onBackToSearch}
            className="mt-4 mb-4 text-white hover:bg-white/10 self-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          
          <div className="flex-1 flex items-end justify-between pb-8">
            <div className="max-w-2xl">
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
              <p className="text-lg text-white/90 mb-4">{tour.description}</p>
              
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
            <Card className="w-80 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <SmartImage
                    category="guide"
                    usageContext="professional"
                    tags={['portrait', 'guide', 'professional', 'certified']}
                    className="w-12 h-12 rounded-full object-cover"
                    fallbackSrc={tour.guide_avatar}
                    alt={`${tour.guide_name} - Professional hiking guide`}
                  />
                  <div>
                    <h3 className="font-semibold">{tour.guide_name}</h3>
                    <p className="text-sm text-muted-foreground">Your Guide</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">From</div>
                    <div className="text-2xl font-bold">
                      {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                      <span className="text-sm font-normal text-muted-foreground"> / person</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Choose Date</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      <option value="">Select available date</option>
                      {tour.available_dates.map((date) => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Guests</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      {Array.from({ length: tour.group_size }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    onClick={() => onBookTour(tour)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Reserve
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">You won't be charged yet</p>
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
            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mountain className="h-6 w-6 text-primary" />
                </div>
                <div className="font-semibold">Epic Scenery</div>
                <div className="text-sm text-muted-foreground">Breathtaking mountain views and pristine landscapes</div>
              </div>
              <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="font-semibold">Small Groups</div>
                <div className="text-sm text-muted-foreground">Intimate groups of max {tour.group_size} adventurers</div>
              </div>
              <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="font-semibold">100% Safety</div>
                <div className="text-sm text-muted-foreground">Certified guides and safety equipment included</div>
              </div>
            </div>

            {/* Tour Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Tour Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Mountain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{highlight}</div>
                        <div className="text-sm text-muted-foreground">Experience the best of {tour.region}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                        fallbackSrc={tour.images[0]}
                        alt={`${tour.title} - Trail views`}
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <SmartImage
                        category="tour"
                        usageContext={tour.region}
                        tags={[tour.region, 'summit', 'peak']}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        fallbackSrc={tour.images[0]}
                        alt={`${tour.title} - Summit views`}
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <SmartImage
                        category="tour"
                        usageContext={tour.region}
                        tags={[tour.region, 'group', 'adventure']}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        fallbackSrc={tour.images[0]}
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
                    <p className="text-muted-foreground">6-8 hours walking, 8-10 miles, 2000ft elevation gain</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Mountain className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-lg">Pack Weight</h4>
                    </div>
                    <p className="text-muted-foreground">10-15 lbs (gear rental available)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-lg">Terrain</h4>
                    </div>
                    <p className="text-muted-foreground">Mountain trails, some rocky sections, well-maintained paths</p>
                  </div>
                </div>

                {/* Difficulty Level Section */}
                <div className="space-y-6 pt-8 border-t">
                  <h4 className="font-semibold text-xl">Difficulty Level</h4>
                  
                  <div className="flex justify-center">
                    <Badge className="bg-red-900 hover:bg-red-900 text-white px-8 py-3 text-base font-semibold rounded-full">
                      Level B - Moderate
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

            {/* Route Map */}
            <Card>
              <CardHeader>
                <CardTitle>Tour Route Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 relative h-64">
                  <div className="absolute inset-4 bg-green-100/50 rounded-lg">
                    <div className="w-full h-full relative">
                      {/* Route visualization */}
                      <div className="absolute top-4 left-4 w-3 h-3 bg-green-600 rounded-full"></div>
                      <div className="absolute top-4 left-4 w-32 h-1 bg-green-600 rounded-full transform rotate-12"></div>
                      <div className="absolute top-8 left-16 w-3 h-3 bg-blue-600 rounded-full"></div>
                      <div className="absolute top-8 left-16 w-24 h-1 bg-blue-600 rounded-full transform rotate-45"></div>
                      <div className="absolute top-16 left-32 w-3 h-3 bg-orange-600 rounded-full"></div>
                      <div className="absolute top-16 left-32 w-20 h-1 bg-orange-600 rounded-full transform rotate-12"></div>
                      <div className="absolute top-20 right-16 w-3 h-3 bg-red-600 rounded-full"></div>
                      
                      {/* Legend */}
                      <div className="absolute bottom-2 left-2 bg-white/80 rounded p-2 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          <span>Start Point</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span>Viewpoint</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          <span>Summit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
                    Distance: 12.5km • Elevation: +850m
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      title: "Meeting Point",
                      shortDesc: "Start your journey with a comprehensive safety briefing and professional equipment check at the trailhead.",
                      longDesc: "We'll gather at the designated meeting point where your experienced guide will conduct a thorough safety briefing covering route conditions, weather expectations, and emergency procedures. You'll receive all necessary safety equipment and have the opportunity to ask questions. The guide will also review the day's objectives, expected timings, and key landmarks you'll encounter along the trail. This is a great time to meet your fellow hikers and ensure everyone is comfortable with the plan ahead.",
                      tags: [tour.region, 'start', 'trailhead', 'preparation']
                    },
                    {
                      title: "Alpine Ascent",
                      shortDesc: "Navigate through stunning alpine meadows and rocky terrain as we steadily gain elevation toward the summit.",
                      longDesc: "The journey begins with a gentle warm-up through ancient forests before opening up to breathtaking alpine meadows dotted with wildflowers. As we gain elevation, the landscape transforms dramatically - you'll traverse rocky switchbacks offering increasingly spectacular views of the surrounding peaks and valleys. Your guide will share fascinating insights about the local geology, flora, and fauna unique to this elevation. We'll maintain a comfortable pace with regular breaks to hydrate, refuel with energy snacks, and capture photos of the stunning vistas.",
                      tags: [tour.region, 'alpine', 'ascent', 'hiking']
                    },
                    {
                      title: "Summit Achievement",
                      shortDesc: "Reach the magnificent peak and celebrate with panoramic 360-degree views that stretch across the entire region.",
                      longDesc: "After hours of steady climbing, you'll experience the incredible feeling of standing on the summit. The panoramic views from the top are truly breathtaking - on clear days, you can see for miles across mountain ranges, valleys, and distant peaks. This is the perfect time to rest, enjoy a well-deserved summit snack, and take photos to commemorate your achievement. Your guide will point out notable landmarks and share stories about the mountain's history and significance. We'll spend quality time at the summit, allowing everyone to soak in the accomplishment and the stunning scenery before beginning our descent.",
                      tags: [tour.region, 'summit', 'achievement', 'peak']
                    },
                    {
                      title: "Return Journey",
                      shortDesc: "Descend through scenic routes with different perspectives, concluding the adventure back at our starting point.",
                      longDesc: "The descent offers an entirely different perspective of the landscape you climbed through earlier. We'll take a slightly different route when possible to maximize your experience and see new terrain. As we lose elevation, you'll notice how the environment changes - from stark alpine zones back through meadows and into the shelter of the forest. Your guide will ensure a safe, controlled descent with attention to tired legs and proper hiking technique. We'll conclude back at the meeting point where you can share stories of your adventure, exchange contact information with new friends, and celebrate your achievement together.",
                      tags: [tour.region, 'descent', 'return', 'completion']
                    }
                  ].map((item, index) => (
                    <div key={index} className="group">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-64 w-full flex-shrink-0">
                          <div className="aspect-[3/2] rounded-lg overflow-hidden">
                            <SmartImage
                              category="tour"
                              usageContext={tour.region}
                              tags={item.tags}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              fallbackSrc={tour.images[0]}
                              alt={item.title}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                            {item.shortDesc}
                          </p>
                          
                          {expandedItinerary[index] && (
                            <p className="text-sm text-muted-foreground leading-relaxed mt-3 animate-fade-in">
                              {item.longDesc}
                            </p>
                          )}
                          
                          <button
                            onClick={() => toggleItinerary(index)}
                            className="text-sm text-primary hover:underline mt-2 font-medium transition-colors"
                          >
                            {expandedItinerary[index] ? "Show less" : "Read more"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meet Your Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Meet Your Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <SmartImage
                    category="guide"
                    usageContext="professional"
                    tags={['portrait', 'guide', 'professional', 'certified']}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                    fallbackSrc={tour.guide_avatar}
                    alt={`${tour.guide_name} - Professional hiking guide`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{tour.guide_name}</h3>
                      <Badge variant="outline" className="text-xs">Certified Guide</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>5+ years experience • First Aid Certified</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expert local guide with extensive knowledge of {tour.region.replace('-', ' ')} trails and wildlife. 
                      Passionate about sharing the natural beauty and cultural heritage of the region.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border rounded-full flex-shrink-0" />
                      <span>Personal hiking boots</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border rounded-full flex-shrink-0" />
                      <span>Travel insurance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border rounded-full flex-shrink-0" />
                      <span>Personal expenses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 border rounded-full flex-shrink-0" />
                      <span>Transportation to meeting point</span>
                    </li>
                  </ul>
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
    </div>
  );
}