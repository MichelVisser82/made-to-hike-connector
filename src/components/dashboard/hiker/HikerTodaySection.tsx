import { Calendar, Mountain, MessageSquare, Heart, User, MapPin, Users, Eye, MessageCircle, AlertCircle, CheckCircle, FileText, Shield, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

interface HikerTodaySectionProps {
  userId: string;
  upcomingTrips: any[];
  completedTrips: number;
  badgesEarned: number;
  savedTours: number;
  onViewTrip: (trip: any) => void;
  onMessageGuide: (guideId: string) => void;
  onNavigateToSection: (section: string, defaultTab?: string) => void;
}

interface ActionItem {
  id: string;
  type: 'waiver' | 'insurance' | 'participant_docs' | 'payment' | 'review' | 'completed';
  priority: 'urgent' | 'medium' | 'completed';
  title: string;
  bookingId: string;
  tourTitle: string;
  daysUntil?: number;
  onClick: () => void;
}

export function HikerTodaySection({
  userId,
  upcomingTrips,
  completedTrips,
  badgesEarned,
  savedTours,
  onViewTrip,
  onMessageGuide,
  onNavigateToSection
}: HikerTodaySectionProps) {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const nextTrip = upcomingTrips[0];
  // Use tour start date from date slot, fallback to booking_date if not available
  const tourStartDate = nextTrip?.tour_date_slots?.slot_date || nextTrip?.booking_date;
  const daysUntilNextTrip = tourStartDate ? Math.ceil((new Date(tourStartDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  // Generate dynamic action items from booking data
  const actionItems = useMemo(() => {
    const items: ActionItem[] = [];

    upcomingTrips.forEach((trip) => {
      // Use tour start date from date slot, fallback to booking_date if not available
      const tripStartDate = trip.tour_date_slots?.slot_date || trip.booking_date;
      const daysUntil = Math.ceil((new Date(tripStartDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const isUrgent = daysUntil <= 5;

      // Check for missing waiver (check both timestamp and data)
      const hasWaiver = trip.waiver_uploaded_at || (trip.waiver_data && Object.keys(trip.waiver_data).length > 0);
      if (!hasWaiver) {
        items.push({
          id: `waiver-${trip.id}`,
          type: 'waiver',
          priority: isUrgent ? 'urgent' : 'medium',
          title: `Upload waiver for ${trip.tour?.title || 'trip'}`,
          bookingId: trip.id,
          tourTitle: trip.tour?.title || 'Unknown Tour',
          daysUntil,
          onClick: () => navigate(`/dashboard/trip/${trip.id}`)
        });
      }

      // Check for missing insurance (check both timestamp and file URL)
      const hasInsurance = trip.insurance_uploaded_at || trip.insurance_file_url;
      if (!hasInsurance) {
        items.push({
          id: `insurance-${trip.id}`,
          type: 'insurance',
          priority: isUrgent ? 'urgent' : 'medium',
          title: `Submit travel insurance for ${trip.tour?.title || 'trip'}`,
          bookingId: trip.id,
          tourTitle: trip.tour?.title || 'Unknown Tour',
          daysUntil,
          onClick: () => navigate(`/dashboard/trip/${trip.id}`)
        });
      }

      // Participant documents: current booking data does not reliably reflect
      // per-participant completion, so we avoid showing potentially incorrect
      // "participants need to complete documents" action items here.
      // When a reliable per-participant summary is available on the booking
      // object, we can re-enable a reminder action based on that field.

      // Check for pending payments
      if (trip.payment_status === 'pending' || trip.payment_status === 'partial') {
        items.push({
          id: `payment-${trip.id}`,
          type: 'payment',
          priority: isUrgent ? 'urgent' : 'medium',
          title: `Complete payment for ${trip.tour?.title || 'trip'}`,
          bookingId: trip.id,
          tourTitle: trip.tour?.title || 'Unknown Tour',
          daysUntil,
          onClick: () => navigate(`/dashboard/trip/${trip.id}`)
        });
      }

      // Add completed items for paid bookings with all documents
      const hasWaiverCompleted = trip.waiver_uploaded_at || (trip.waiver_data && Object.keys(trip.waiver_data).length > 0);
      const hasInsuranceCompleted = trip.insurance_uploaded_at || trip.insurance_file_url;
      
      if (trip.payment_status === 'paid' && hasWaiverCompleted && hasInsuranceCompleted) {
        items.push({
          id: `completed-${trip.id}`,
          type: 'completed',
          priority: 'completed',
          title: `All documents submitted — ${trip.tour?.title || 'trip'}`,
          bookingId: trip.id,
          tourTitle: trip.tour?.title || 'Unknown Tour',
          onClick: () => navigate(`/dashboard/trip/${trip.id}`)
        });
      }
    });

    // Sort: urgent first, then medium, then completed
    // Within each priority, sort by days until trip
    return items
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, medium: 1, completed: 2 };
        if (a.priority !== b.priority) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return (a.daysUntil || 999) - (b.daysUntil || 999);
      })
      .slice(0, 5); // Show max 5 items
  }, [upcomingTrips, navigate]);

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
      gradient: 'from-burgundy to-burgundy-dark',
      iconColor: 'text-burgundy'
    },
    {
      icon: Calendar,
      label: 'Trips Completed',
      value: completedTrips,
      subtext: `+2 this year`,
      gradient: 'from-sage to-sage-dark',
      iconColor: 'text-sage'
    },
    {
      icon: MessageSquare,
      label: 'Badges Earned',
      value: badgesEarned,
      subtext: '5 regions explored',
      gradient: 'from-gold to-gold-dark',
      iconColor: 'text-gold'
    },
    {
      icon: Heart,
      label: 'Saved Tours',
      value: savedTours,
      subtext: 'In your wishlist',
      gradient: 'from-burgundy to-burgundy-dark',
      iconColor: 'text-burgundy'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-burgundy to-burgundy-dark text-white rounded-lg p-8 shadow-md">
        <h1 className="text-3xl font-playfair mb-2">Welcome Back, {profile?.name || 'Hiker'}</h1>
        <p className="text-white/90">{currentDate}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-shadow border-burgundy/10 bg-white ${
              metric.label === 'Saved Tours' || metric.label === 'Trips Completed' || metric.label === 'Next Adventure' ? 'cursor-pointer' : ''
            }`}
            onClick={
              metric.label === 'Saved Tours' 
                ? () => onNavigateToSection('my-trips', 'wishlist')
                : metric.label === 'Trips Completed'
                ? () => onNavigateToSection('my-trips', 'past')
                : metric.label === 'Next Adventure'
                ? () => onNavigateToSection('my-trips', 'upcoming')
                : undefined
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-charcoal">{metric.value}</p>
                <p className="text-sm font-medium text-charcoal/70">{metric.label}</p>
                <p className="text-xs text-charcoal/60">{metric.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trips */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-playfair text-charcoal">Upcoming Trips</h2>
            <Button variant="link" className="text-burgundy hover:text-burgundy-dark">View All →</Button>
          </div>

          {upcomingTrips.length > 0 ? (
            upcomingTrips.slice(0, 2).map((trip) => (
              <Card key={trip.id} className="border-burgundy/10 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={trip.status === 'confirmed' ? 'default' : 'secondary'}
                          className={trip.status === 'confirmed' ? 'bg-sage text-white' : 'bg-gold/20 text-gold-dark'}
                        >
                          {trip.status === 'confirmed' ? 'Confirmed' : 'Action Needed'}
                        </Badge>
                        <span className="text-sm text-charcoal/60">
                          Oct 15, 2025
                        </span>
                      </div>
                      <h3 className="text-xl font-playfair text-charcoal mb-2">{trip.tour?.title}</h3>
                      <div className="space-y-1 text-sm text-charcoal/70">
                        <p className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>Guide: {trip.tour?.guide_display_name}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{trip.tour?.meeting_point}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{trip.participants} Guests</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-burgundy">{daysUntilNextTrip}</div>
                      <div className="text-sm text-charcoal/60">days</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onViewTrip(trip)} 
                      className="flex-1 bg-burgundy hover:bg-burgundy-dark text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      onClick={() => onMessageGuide(trip.tour?.guide_id)} 
                      variant="outline" 
                      className="flex-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-burgundy/10 bg-white shadow-md">
              <CardContent className="p-12 text-center">
                <Mountain className="w-16 h-16 mx-auto mb-4 text-burgundy/30" />
                <h3 className="text-xl font-playfair text-charcoal mb-2">No Upcoming Trips</h3>
                <p className="text-charcoal/70 mb-4">Start planning your next adventure</p>
                <Button className="bg-burgundy hover:bg-burgundy-dark text-white">Explore Tours</Button>
              </CardContent>
            </Card>
          )}

          {nextTrip && (
            <Card className="bg-gold/10 border-gold/20 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/20 rounded-full">
                    <MessageSquare className="w-5 h-5 text-gold-dark" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-charcoal mb-1">Trip Preparation</h4>
                    <p className="text-sm text-charcoal/70 mb-2">
                      You have 2 action items for your upcoming Mont Blanc trek
                    </p>
                    <Button variant="outline" size="sm" className="bg-white border-burgundy/30 text-burgundy hover:bg-burgundy/5">
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
          <Card className="border-burgundy/10 bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-playfair text-charcoal">Action Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionItems.length > 0 ? (
                actionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={item.onClick}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      item.priority === 'urgent'
                        ? 'bg-gold/10 border border-gold/20 hover:bg-gold/15'
                        : item.priority === 'completed'
                        ? 'bg-sage/5 border border-sage/20'
                        : 'bg-cream hover:bg-cream/80'
                    }`}
                  >
                    {item.priority === 'urgent' && (
                      <Badge variant="destructive" className="mt-1 bg-burgundy shrink-0">Urgent</Badge>
                    )}
                    {item.priority === 'medium' && (
                      <Badge variant="outline" className="mt-1 border-burgundy/30 text-burgundy shrink-0">To-do</Badge>
                    )}
                    {item.priority === 'completed' && (
                      <div className="w-5 h-5 rounded-full bg-sage mt-1 shrink-0 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          item.priority === 'completed'
                            ? 'text-charcoal/60 line-through'
                            : 'text-charcoal'
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.daysUntil !== undefined && item.priority !== 'completed' && (
                        <p className="text-xs text-charcoal/50 mt-0.5">
                          {item.daysUntil} days until trip
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-sage" />
                  <p className="text-sm text-charcoal/70">All caught up!</p>
                  <p className="text-xs text-charcoal/50 mt-1">No action items at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-burgundy/10 bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-playfair text-charcoal">For You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4" 
                  alt="Tour recommendation"
                  className="w-full h-40 object-cover"
                />
                <Button size="sm" variant="ghost" className="absolute top-2 right-2 bg-white/90 hover:bg-white">
                  <Heart className="w-4 h-4 text-burgundy" />
                </Button>
              </div>
              <h4 className="font-playfair font-semibold text-charcoal mb-1">Dolomites Via Ferrata</h4>
              <p className="text-sm text-charcoal/70 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Italy</span>
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-burgundy">€340</span>
                <Button size="sm" variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5">
                  Explore More Tours
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
