import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Mountain, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripHeroSectionProps {
  tripDetails: TripDetails;
}

export function TripHeroSection({ tripDetails }: TripHeroSectionProps) {
  const { booking, tour } = tripDetails;

  const getStatusBadge = () => {
    if (booking.status === 'confirmed') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Confirmed</Badge>;
    }
    if (booking.status === 'pending') {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Action Needed</Badge>;
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
        {/* Status Badge - Top Left */}
        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>
        {/* Wishlist Heart - Top Right */}
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full w-10 h-10"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      {/* Title, Location, Price */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-semibold mb-2">{tour.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{tour.meeting_point || tour.region || 'Location TBD'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(booking.booking_date), 'MMMM d-d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#7c2843]">
              {getCurrencySymbol(booking.currency)}{booking.total_price}
            </div>
            <div className="text-sm text-muted-foreground">per person</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Icons */}
      <div className="grid grid-cols-4 divide-x border-b">
        <div className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Difficulty</div>
            <div className="font-semibold capitalize">{tour.difficulty || 'Advanced'}</div>
          </div>
        </div>
        <div className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="font-semibold">{tour.duration || '3 Days'}</div>
          </div>
        </div>
        <div className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Group Size</div>
            <div className="font-semibold">{booking.participants} Guests</div>
          </div>
        </div>
        <div className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Mountain className="w-5 h-5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Max Altitude</div>
            <div className="font-semibold">{tour.max_altitude || '4,808m'}</div>
          </div>
        </div>
      </div>

      {/* Waiver Alert Banner */}
      {!booking.waiver_uploaded_at && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center text-xs">!</div>
            <span className="font-medium">Waiver document required</span>
          </div>
        </div>
      )}
    </div>
  );
}
