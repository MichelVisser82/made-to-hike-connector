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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
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
                <CardTitle>Fitness Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Required</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Good overall fitness level</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Able to walk for 6+ hours</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Previous hiking experience</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Comfortable with heights</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Provided</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="text-sm">Professional hiking guide</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="text-sm">Safety equipment included</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="text-sm">Emergency first aid kit</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="text-sm">Route guidance & navigation</span>
                      </div>
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
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <SmartImage
                        category="tour"
                        usageContext={tour.region}
                        tags={[tour.region, 'start', 'trailhead']}
                        className="w-full h-full object-cover"
                        fallbackSrc={tour.images[0]}
                        alt="Tour starting point"
                      />
                    </div>
                    <div>
                      <div className="font-medium">Meeting Point</div>
                      <div className="text-sm text-muted-foreground">{tour.meeting_point}</div>
                      <div className="text-sm text-muted-foreground">Begin your adventure with a safety briefing and equipment check</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <SmartImage
                        category="tour"
                        usageContext={tour.region}
                        tags={[tour.region, 'summit', 'achievement']}
                        className="w-full h-full object-cover"
                        fallbackSrc={tour.images[0]}
                        alt="Summit achievement"
                      />
                    </div>
                    <div>
                      <div className="font-medium">Summit Achievement</div>
                      <div className="text-sm text-muted-foreground">Reach the peak and enjoy panoramic views</div>
                      <div className="text-sm text-muted-foreground">Photo opportunities and well-deserved rest at the summit</div>
                    </div>
                  </div>
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

          {/* Simplified Sidebar */}
          <div className="space-y-6">

            {/* Reviews & Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-current" />
                  Reviews & Testimonials
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{tour.rating} • {tour.reviews_count} reviews</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="text-sm italic mb-2">
                    "An absolutely incredible experience! The views were breathtaking and {tour.guide_name} was an amazing guide."
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Sarah M. • 2 weeks ago</span>
                  </div>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <p className="text-sm italic mb-2">
                    "Perfect for our fitness level. Well organized and safe throughout the entire journey."
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Mike R. • 1 month ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Tours in Area */}
            <Card>
              <CardHeader>
                <CardTitle>Other Tours in the Area</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <SmartImage
                      category="tour"
                      usageContext={tour.region}
                      tags={[tour.region, 'alternative', 'nearby']}
                      className="w-full h-full object-cover"
                      fallbackSrc={tour.images[0]}
                      alt="Alternative tour option"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Beginner {tour.region.replace('-', ' ')} Hike</div>
                    <div className="text-xs text-muted-foreground">From {tour.currency === 'EUR' ? '€' : '£'}{Math.round(tour.price * 0.7)}</div>
                  </div>
                </div>
                <div className="flex gap-3 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <SmartImage
                      category="tour"
                      usageContext={tour.region}
                      tags={[tour.region, 'challenging', 'advanced']}
                      className="w-full h-full object-cover"
                      fallbackSrc={tour.images[0]}
                      alt="Advanced tour option"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Advanced {tour.region.replace('-', ' ')} Trek</div>
                    <div className="text-xs text-muted-foreground">From {tour.currency === 'EUR' ? '€' : '£'}{Math.round(tour.price * 1.3)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}