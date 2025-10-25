import { Calendar, Mountain, MessageSquare, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';

interface HikerTodaySectionProps {
  userId: string;
  upcomingTrips: any[];
  completedTrips: number;
  badgesEarned: number;
  savedTours: number;
  onViewTrip: (trip: any) => void;
  onMessageGuide: (guideId: string) => void;
}

export function HikerTodaySection({
  userId,
  upcomingTrips,
  completedTrips,
  badgesEarned,
  savedTours,
  onViewTrip,
  onMessageGuide
}: HikerTodaySectionProps) {
  const { profile } = useProfile();
  const nextTrip = upcomingTrips[0];
  const daysUntilNextTrip = nextTrip ? Math.ceil((new Date(nextTrip.booking_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const metrics = [
    {
      icon: Mountain,
      label: 'Next Adventure',
      value: daysUntilNextTrip > 0 ? `${daysUntilNextTrip} Days` : 'Not scheduled',
      subtext: nextTrip?.tour?.title || 'No upcoming trips',
      gradient: 'from-primary to-primary-dark',
      iconColor: 'text-primary'
    },
    {
      icon: Calendar,
      label: 'Trips Completed',
      value: completedTrips,
      subtext: `+2 this year`,
      gradient: 'from-green-500 to-green-700',
      iconColor: 'text-green-500'
    },
    {
      icon: MessageSquare,
      label: 'Badges Earned',
      value: badgesEarned,
      subtext: '5 regions explored',
      gradient: 'from-orange-500 to-orange-700',
      iconColor: 'text-orange-500'
    },
    {
      icon: Heart,
      label: 'Saved Tours',
      value: savedTours,
      subtext: 'In your wishlist',
      gradient: 'from-primary to-primary-dark',
      iconColor: 'text-primary'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-8">
        <h1 className="text-3xl font-serif mb-2">Welcome Back, {profile?.name || 'Hiker'}</h1>
        <p className="text-white/90">{currentDate}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-xs text-muted-foreground">{metric.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trips */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Upcoming Trips</h2>
            <Button variant="link" className="text-primary">View All →</Button>
          </div>

          {upcomingTrips.length > 0 ? (
            upcomingTrips.slice(0, 2).map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={trip.status === 'confirmed' ? 'default' : 'secondary'}>
                          {trip.status === 'confirmed' ? 'Confirmed' : 'Action Needed'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Oct 15, 2025
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{trip.tour?.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>👤 Guide: {trip.tour?.guide_display_name}</p>
                        <p>📍 {trip.tour?.meeting_point}</p>
                        <p>👥 {trip.participants} Guests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary">{daysUntilNextTrip}</div>
                      <div className="text-sm text-muted-foreground">days</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => onViewTrip(trip)} variant="outline" className="flex-1">
                      👁️ View Details
                    </Button>
                    <Button onClick={() => onMessageGuide(trip.tour?.guide_id)} variant="outline" className="flex-1">
                      💬 Message Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Mountain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Trips</h3>
                <p className="text-muted-foreground mb-4">Start planning your next adventure</p>
                <Button>Explore Tours</Button>
              </CardContent>
            </Card>
          )}

          {nextTrip && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Trip Preparation</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      You have 2 action items for your upcoming Mont Blanc trek
                    </p>
                    <Button variant="outline" size="sm" className="bg-white">
                      View Checklist
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Items & For You */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Action Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Badge variant="destructive" className="mt-1">Urgent</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Upload waiver for Mont Blanc Trek</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className="w-5 h-5 rounded-full bg-muted-foreground/20 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Review your experience with Emma</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <span className="text-xs">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground line-through">
                    Payment confirmed — Scottish Highlands
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">For You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4" 
                  alt="Tour recommendation"
                  className="w-full h-40 object-cover"
                />
                <Button size="sm" variant="ghost" className="absolute top-2 right-2 bg-white/90 hover:bg-white">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <h4 className="font-semibold mb-1">Dolomites Via Ferrata</h4>
              <p className="text-sm text-muted-foreground mb-2">📍 Italy</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">€340</span>
                <Button size="sm" variant="outline">Explore More Tours</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
