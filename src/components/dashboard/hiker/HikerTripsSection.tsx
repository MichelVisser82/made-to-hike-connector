import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Clock, Star, Heart } from 'lucide-react';

interface HikerTripsSectionProps {
  userId: string;
  onViewTour: (tourId: string) => void;
  onMessageGuide: (guideId: string) => void;
}

export function HikerTripsSection({ userId, onViewTour, onMessageGuide }: HikerTripsSectionProps) {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data - replace with actual data fetching
  const upcomingTrips = [
    {
      id: '1',
      title: 'Mont Blanc Summit Trek',
      dates: 'October 15-17, 2025',
      guide: { name: 'Sarah Mountain', avatar: '' },
      location: 'Chamonix, France',
      guests: 2,
      difficulty: 'Advanced',
      days: 3,
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    },
    {
      id: '2',
      title: 'Scottish Highlands Adventure',
      dates: 'November 2-4, 2025',
      guide: { name: 'James MacDonald', avatar: '' },
      location: 'Glen Coe, Scotland',
      guests: 2,
      difficulty: 'Intermediate',
      days: 3,
      status: 'action_needed',
      image: 'https://images.unsplash.com/photo-1552084117-56a1e49ff5e0'
    }
  ];

  const pastTrips = [
    {
      id: '3',
      title: 'Dolomites Via Ferrata',
      dates: 'September 18-22, 2024',
      guide: { name: 'Marco Rossi', avatar: '' },
      location: 'Cortina d\'Ampezzo, Italy',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      reviewPending: false
    },
    {
      id: '4',
      title: 'Bavarian Alps Trek',
      dates: 'August 5-7, 2024',
      guide: { name: 'Hans Mueller', avatar: '' },
      location: 'Garmisch, Germany',
      rating: 4,
      image: 'https://images.unsplash.com/photo-1552084117-56a1e49ff5e0',
      reviewPending: true
    }
  ];

  const wishlist = [
    {
      id: '5',
      title: 'Norwegian Fjords Trek',
      location: 'Geiranger, Norway',
      guide: 'Erik Hansen',
      rating: 4.9,
      reviews: 127,
      price: 780,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    },
    {
      id: '6',
      title: 'Patagonia Ice Fields',
      location: 'El Chaltén, Argentina',
      guide: 'Carlos Mendez',
      rating: 5.0,
      reviews: 203,
      price: 1200,
      image: 'https://images.unsplash.com/photo-1552084117-56a1e49ff5e0'
    }
  ];

  const savedGuides = [
    {
      id: '1',
      name: 'Sarah Mountain',
      location: 'Chamonix, France',
      rating: 4.9,
      tours: 12,
      specialties: ['Alpine Mountaineering', 'Glacier Travel', 'Technical Climbing'],
      certifications: ['IFMGA', 'WFR'],
      avatar: '',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    }
  ];

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
          <div className="flex justify-end">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </div>

          {upcomingTrips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <div className="relative h-64 md:h-auto">
                  <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
                  <Badge 
                    variant={trip.status === 'confirmed' ? 'default' : 'secondary'}
                    className="absolute top-4 left-4"
                  >
                    {trip.status === 'confirmed' ? 'Confirmed' : 'Action Needed'}
                  </Badge>
                </div>
                <div className="md:col-span-2 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">{trip.title}</h3>
                      <p className="text-muted-foreground mb-4">{trip.dates}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-primary">€890</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{trip.guide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">Guide: {trip.guide.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{trip.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{trip.guests} Guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{trip.days} Days</span>
                    </div>
                  </div>

                  {trip.status === 'action_needed' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-orange-100">⚠️</Badge>
                        <span className="font-medium">Waiver document required</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <Button variant="default" className="w-full">
                      📋 View Itinerary
                    </Button>
                    <Button variant="outline" className="w-full">
                      🎯 Trip Preparation
                    </Button>
                    <Button variant="outline" className="w-full">
                      💬 Message Guide
                    </Button>
                    <Button variant="outline" className="w-full">
                      📍 Meeting Point
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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
                      className="w-full"
                    >
                      ⭐ {trip.reviewPending ? 'Write Review' : 'View Your Review'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      🔄 Book Again
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
    </div>
  );
}
