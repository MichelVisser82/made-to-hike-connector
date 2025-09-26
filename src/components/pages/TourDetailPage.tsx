import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Star, MapPin, Users, Clock, ArrowLeft, Calendar, Shield, CheckCircle } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBackToSearch}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="aspect-video rounded-lg overflow-hidden mb-6">
              <SmartImage
                category="tour"
                usageContext={tour.region}
                tags={[tour.region, tour.difficulty, 'landscape', 'hiking', 'detailed']}
                className="w-full h-full object-cover"
                fallbackSrc={tour.images[0]}
                alt={`${tour.title} - Detailed view of ${tour.region} hiking tour`}
                priority="high"
              />
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="aspect-square rounded-lg overflow-hidden">
                <SmartImage
                  category="tour"
                  usageContext={tour.region}
                  tags={[tour.region, 'trail', 'path', 'hiking']}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  fallbackSrc={tour.images[0]}
                  alt={`${tour.title} - Mountain trail and hiking path views`}
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <SmartImage
                  category="tour"
                  usageContext={tour.region}
                  tags={[tour.region, 'summit', 'peak', 'view']}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  fallbackSrc={tour.images[0]}
                  alt={`${tour.title} - Summit views and mountain peaks`}
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <SmartImage
                  category="tour"
                  usageContext={tour.region}
                  tags={[tour.region, 'group', 'hikers', 'adventure']}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  fallbackSrc={tour.images[0]}
                  alt={`${tour.title} - Group hiking adventures and team experiences`}
                />
              </div>
            </div>

            {/* Tour Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{tour.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="capitalize">{tour.region.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent fill-current" />
                      <span>{tour.rating} ({tour.reviews_count} reviews)</span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={tour.difficulty === 'easy' ? 'secondary' : 
                          tour.difficulty === 'moderate' ? 'default' : 'destructive'}
                >
                  {tour.difficulty}
                </Badge>
              </div>

              <p className="text-lg text-muted-foreground">{tour.description}</p>
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{tour.duration}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="font-semibold">Max {tour.group_size}</div>
                <div className="text-sm text-muted-foreground">Group Size</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Badge className="mb-2">{tour.difficulty}</Badge>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{tour.meeting_point}</div>
                <div className="text-sm text-muted-foreground">Meeting Point</div>
              </div>
            </div>

            {/* Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Tour Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tour.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tour.includes.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Guide Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <SmartImage
                    category="guide"
                    usageContext="avatar"
                    tags={['portrait', 'guide', 'professional', 'large']}
                    className="w-16 h-16 rounded-full object-cover"
                    fallbackSrc={tour.guide_avatar}
                    alt={`${tour.guide_name} - Certified professional hiking guide portrait`}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{tour.guide_name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Certified Professional Guide</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Book This Tour</CardTitle>
                  <div className="text-2xl font-bold">
                    {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Available Dates</label>
                  <select className="w-full px-3 py-2 border rounded-md bg-background">
                    <option value="">Select a date</option>
                    {tour.available_dates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Hikers</label>
                  <select className="w-full px-3 py-2 border rounded-md bg-background">
                    {Array.from({ length: tour.group_size }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'person' : 'people'}
                      </option>
                    ))}
                  </select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tour price</span>
                    <span>{tour.currency === 'EUR' ? '€' : '£'}{tour.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
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

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => onBookTour(tour)}
                >
                  Book Now
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Free cancellation up to 48 hours before departure</p>
                </div>
              </CardContent>
            </Card>

            {/* Safety Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Safety & Trust
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Certified guide with 5+ years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Comprehensive safety equipment provided</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Emergency communication devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Full insurance coverage included</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}