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
      return <Badge className="bg-sage text-white border-0">Confirmed</Badge>;
    }
    if (booking.status === 'pending') {
      return <Badge className="bg-gold text-white border-0">Action Needed</Badge>;
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
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        {tour.hero_image ? (
          <img
            src={tour.hero_image}
            alt={tour.title}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-50" />
        )}
        {/* Status Badge - Top Left */}
        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>
        {/* Wishlist Heart - Top Right */}
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
        >
          <Heart className="w-5 h-5 text-burgundy" />
        </Button>
      </div>

      {/* Title Section */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl text-charcoal mb-2 font-playfair">
              {tour.title}
            </h1>
            <div className="flex items-center gap-4 text-charcoal/70">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-burgundy" />
                <span>{tour.meeting_point || tour.region || tour.location || 'Location TBD'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-burgundy" />
                <span>{format(new Date(booking.booking_date), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl text-burgundy mb-1 font-playfair">
              {getCurrencySymbol(booking.currency)}{booking.total_price}
            </div>
            <div className="text-sm text-charcoal/60">per person</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <TrendingUp className="w-5 h-5 text-burgundy mb-2" />
            <div className="text-sm text-charcoal/60 mb-1">Difficulty</div>
            <div className="font-medium text-charcoal capitalize">{tour.difficulty || 'Advanced'}</div>
          </div>
          <div className="p-4 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <Calendar className="w-5 h-5 text-burgundy mb-2" />
            <div className="text-sm text-charcoal/60 mb-1">Duration</div>
            <div className="font-medium text-charcoal">{tour.duration || '3 Days'}</div>
          </div>
          <div className="p-4 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <Users className="w-5 h-5 text-burgundy mb-2" />
            <div className="text-sm text-charcoal/60 mb-1">Group Size</div>
            <div className="font-medium text-charcoal">{booking.participants} Guests</div>
          </div>
          <div className="p-4 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <Mountain className="w-5 h-5 text-burgundy mb-2" />
            <div className="text-sm text-charcoal/60 mb-1">Max Altitude</div>
            <div className="font-medium text-charcoal">
              {tour.max_altitude ? `${tour.max_altitude}m` : 'Varies'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
