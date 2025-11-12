import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripHeroSectionProps {
  tripDetails: TripDetails;
}

export function TripHeroSection({ tripDetails }: TripHeroSectionProps) {
  const { booking, tour } = tripDetails;
  const daysUntilTrip = differenceInDays(new Date(booking.booking_date), new Date());
  const isUpcoming = daysUntilTrip >= 0;

  const getStatusBadge = () => {
    if (booking.status === 'confirmed') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✓ Confirmed</Badge>;
    }
    if (booking.status === 'pending') {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">⚠ Action Needed</Badge>;
    }
    return <Badge variant="secondary">{booking.status}</Badge>;
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden border shadow-sm">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80">
        {tour.hero_image ? (
          <img
            src={tour.hero_image}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>
        {isUpcoming && (
          <div className="absolute top-4 right-4 bg-card/95 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{daysUntilTrip}</div>
              <div className="text-sm text-muted-foreground">days until trip</div>
            </div>
          </div>
        )}
      </div>

      {/* Trip Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{tour.title}</h1>
            <p className="text-lg text-muted-foreground">
              {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Total Price</div>
            <div className="text-3xl font-bold text-primary">
              {getCurrencySymbol(booking.currency)}{booking.total_price}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">{tour.duration}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Participants</div>
              <div className="font-medium">{booking.participants} {booking.participants === 1 ? 'person' : 'people'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
              <div className="font-medium capitalize">{tour.difficulty}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Reference</div>
              <div className="font-medium text-xs">{booking.booking_reference}</div>
            </div>
          </div>
        </div>

        {/* Alert Banner for Pending Actions */}
        {booking.status === 'pending' && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Action Required</h3>
                <p className="text-sm text-orange-700">
                  Please complete your trip preparation to confirm your booking.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
