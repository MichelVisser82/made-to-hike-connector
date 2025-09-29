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
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-8">
            <Button
              variant="ghost"
              onClick={onBackToSearch}
              className="mb-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
            
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 text-white/90">
                  <Star className="h-4 w-4 text-accent fill-current" />
                  <span className="text-sm">{tour.rating}</span>
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  {tour.difficulty}
                </Badge>
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
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Mountain className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold text-sm">Epic Views</div>
                <div className="text-xs text-muted-foreground">Stunning panoramas</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold text-sm">Small Groups</div>
                <div className="text-xs text-muted-foreground">Max {tour.group_size} people</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold text-sm">Safety First</div>
                <div className="text-xs text-muted-foreground">Certified guides</div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-2 md:col-span-1 row-span-2 aspect-square rounded-lg overflow-hidden">
                    <SmartImage
                      category="tour"
                      usageContext={tour.region}
                      tags={[tour.region, 'landscape', 'main', 'featured']}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      fallbackSrc={tour.images[0]}
                      alt={`${tour.title} - Featured landscape view`}
                    />
                  </div>
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
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <SmartImage
                      category="tour"
                      usageContext={tour.region}
                      tags={[tour.region, 'nature', 'wildlife']}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      fallbackSrc={tour.images[0]}
                      alt={`${tour.title} - Nature and wildlife`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fitness Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Fitness Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Fitness Level</div>
                      <div className="text-sm text-muted-foreground">
                        {tour.difficulty === 'easy' ? 'Suitable for beginners' : 
                         tour.difficulty === 'moderate' ? 'Moderate fitness required' : 
                         'High fitness level required'}
                      </div>
                    </div>
                    <Badge variant={tour.difficulty === 'easy' ? 'secondary' : 
                                  tour.difficulty === 'moderate' ? 'default' : 'destructive'}>
                      {tour.difficulty}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-primary" />
                      <span className="text-sm">Regular hiking experience recommended</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">All fitness levels welcome</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Tour Route Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-8 text-center">
                  <Navigation className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="font-medium mb-2">Interactive Route Map</div>
                  <div className="text-sm text-muted-foreground">
                    Detailed map showing the complete hiking route, waypoints, and key landmarks
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

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">From</div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                </div>
                <div className="text-sm text-muted-foreground">per person</div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  size="lg"
                  className="w-full"
                  onClick={() => onBookTour(tour)}
                >
                  Begin Your Scottish Adventure
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>You won't be charged yet</p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{tour.currency === 'EUR' ? '€' : '£'}{tour.price} x 1 guest</span>
                    <span>{tour.currency === 'EUR' ? '€' : '£'}{tour.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>{tour.currency === 'EUR' ? '€' : '£'}{Math.round(tour.price * 0.05)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {tour.currency === 'EUR' ? '€' : '£'}
                      {tour.price + Math.round(tour.price * 0.05)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

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