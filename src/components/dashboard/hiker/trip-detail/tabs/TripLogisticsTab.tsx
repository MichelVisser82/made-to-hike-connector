import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Navigation, Car, User } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';
import { format } from 'date-fns';

interface TripLogisticsTabProps {
  tripDetails: TripDetails;
}

export function TripLogisticsTab({ tripDetails }: TripLogisticsTabProps) {
  const { tour, guide, booking } = tripDetails;

  const handleOpenMaps = () => {
    if (tour.meeting_point_lat && tour.meeting_point_lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${tour.meeting_point_lat},${tour.meeting_point_lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Logistics & Meeting Point</h2>
        <p className="text-muted-foreground">
          Everything you need to know about meeting up and getting started
        </p>
      </div>

      {/* Meeting Point */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Meeting Point</h3>
              <p className="text-muted-foreground mb-4">
                {tour.meeting_point || 'Meeting point to be confirmed'}
              </p>
              {(tour.meeting_point_lat && tour.meeting_point_lng) && (
                <Button onClick={handleOpenMaps} variant="outline">
                  <Navigation className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              )}
            </div>
          </div>

          {/* Map placeholder */}
          {(tour.meeting_point_lat && tour.meeting_point_lng) && (
            <div className="mt-4 h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Interactive map coming soon</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Time */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Meeting Time</h3>
              <p className="text-muted-foreground mb-2">
                {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                Your guide will confirm the exact meeting time closer to the date.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Guide</div>
                <div className="font-medium">{guide.display_name}</div>
              </div>
            </div>

            {guide.phone && (
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <a href={`tel:${guide.phone}`} className="font-medium hover:text-primary">
                    {guide.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Contact via platform</div>
                <div className="font-medium">Message through dashboard</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting There */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Getting There</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Plan your journey to the meeting point. Your guide will provide detailed directions and parking information closer to the date.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Public transport options available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Parking information will be shared</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Arrive 15 minutes early</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
