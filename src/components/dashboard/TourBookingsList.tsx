import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { TourBookingSummary } from '@/hooks/useGuideBookingsByTour';

interface TourBookingsListProps {
  tours: TourBookingSummary[];
  loading: boolean;
}

export function TourBookingsList({ tours, loading }: TourBookingsListProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <Card className="p-12 text-center border-burgundy/10">
        <Users className="w-16 h-16 text-charcoal/40 mx-auto mb-4" />
        <h3 className="text-lg font-playfair text-charcoal mb-2">
          No tours with bookings
        </h3>
        <p className="text-sm text-charcoal/60">
          Tours with bookings will appear here
        </p>
      </Card>
    );
  }

  // Sort tours by date (earliest first)
  const sortedTours = [...tours].sort((a, b) => 
    new Date(a.earliest_date).getTime() - new Date(b.earliest_date).getTime()
  );

  // Split into upcoming and past tours
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingTours = sortedTours.filter(tour => 
    new Date(tour.earliest_date) >= today
  );
  
  const pastTours = sortedTours.filter(tour => 
    new Date(tour.earliest_date) < today
  );

  const renderTourCard = (tour: TourBookingSummary) => (
        <Card
          key={`${tour.tour_id}_${tour.earliest_date}`}
          className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-burgundy/10"
          onClick={() => navigate(`/dashboard/bookings/tour/${tour.tour_slug}?date=${tour.earliest_date}`)}
        >
          <div className="flex gap-4 p-4">
            {/* Tour Image */}
            <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              {tour.tour_hero_image ? (
                <img
                  src={tour.tour_hero_image}
                  alt={tour.tour_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Tour Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold font-playfair text-charcoal truncate">
                    {tour.tour_title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-charcoal/60 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(tour.earliest_date), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tour.tour_location}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {tour.confirmed_bookings > 0 && (
                    <Badge variant="secondary" className="bg-sage/10 text-sage border-sage/20">
                      Confirmed
                    </Badge>
                  )}
                  {tour.pending_bookings > 0 && (
                    <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                      Open
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-sm text-charcoal">
                  <Users className="w-4 h-4 text-charcoal/60" />
                  <span className="font-medium">
                    {tour.total_participants} / {tour.max_group_size} participants
                  </span>
                </div>
                <Button variant="outline" size="sm" className="text-burgundy border-burgundy/20 hover:bg-burgundy/10">
                  View Details & Message Group
                </Button>
              </div>
            </div>
          </div>
        </Card>
  );

  return (
    <div className="space-y-8">
      {/* Upcoming Tours Section */}
      {upcomingTours.length > 0 && (
        <div className="space-y-4">
          {upcomingTours.map(renderTourCard)}
        </div>
      )}

      {/* Past Tours Section */}
      {pastTours.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-6 border-t border-burgundy/10">
            <h3 className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">
              Past Date Tours
            </h3>
          </div>
          {pastTours.map(renderTourCard)}
        </div>
      )}
    </div>
  );
}
