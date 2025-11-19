import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Mountain, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TripDetails } from '@/hooks/useTripDetails';
import { SmartImage } from '@/components/SmartImage';

interface TripHeroSectionProps {
  tripDetails: TripDetails;
}

export function TripHeroSection({ tripDetails }: TripHeroSectionProps) {
  const { booking, tour } = tripDetails;
  
  if (!tour) {
    return (
      <div className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
        <p className="text-charcoal/60">Tour information unavailable</p>
      </div>
    );
  }

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

  // Derive effective values using offer data when present
  const offerPricePerPerson = (tour as any).offer_price_per_person as number | null | undefined;
  const computedFallbackPerPerson = booking.participants > 0 
    ? booking.total_price / booking.participants 
    : booking.total_price;
  const displayPrice = offerPricePerPerson ?? computedFallbackPerPerson;
  const priceLabel = offerPricePerPerson ? 'per person' : (booking.participants > 1 ? 'total' : 'per person');

  const offerGroupSize = (tour as any).offer_group_size as number | null | undefined;
  const effectiveGroupSize = offerGroupSize ?? booking.participants;

  const offerDuration = (tour as any).offer_duration as string | null | undefined;
  const effectiveDuration = offerDuration || tour.duration || '3 Days';

  const effectiveDifficulty = tour.difficulty || 'Advanced';
  const distanceLabel = tour.distance_km ? `${tour.distance_km} km` : 'Multi-day';

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
          <SmartImage
            category="hero"
            usageContext="tour"
            tags={['mountain', 'hiking', 'adventure']}
            className="w-full h-96 object-cover"
            alt={tour.title}
            priority="high"
          />
        )}
        {/* Status Badge - Top Left */}
        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>
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
                <span>{tour.meeting_point_formatted || tour.meeting_point || tour.region || 'Location TBD'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-burgundy" />
                <span>{format(new Date(booking.booking_date), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl text-burgundy mb-1 font-playfair">
              {getCurrencySymbol(booking.currency)}{displayPrice.toFixed(0)}
            </div>
            <div className="text-sm text-charcoal/60">{priceLabel}</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <TrendingUp className="w-5 h-5 text-burgundy mb-2" />
            <div className="text-sm text-charcoal/60 mb-1">Difficulty</div>
            <div className="font-medium text-charcoal capitalize">{effectiveDifficulty}</div>
          </div>
          <div className="p-4 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <Calendar className="w-5 h-5 text-burgundy mb-2" />
            <div className="text-sm text-charcoal/60 mb-1">Duration</div>
            <div className="font-medium text-charcoal">{effectiveDuration}</div>
          </div>
          <div className="p-4 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <Users className="w-5 h-5 text-burgundy mb-2" />
            <div className="text-sm text-charcoal/60 mb-1">Group Size</div>
            <div className="font-medium text-charcoal">
              {effectiveGroupSize} {effectiveGroupSize === 1 ? 'Guest' : 'Guests'}
            </div>
          </div>
          <div className="p-4 bg-white border border-burgundy/10 rounded-lg shadow-sm">
            <Mountain className="w-5 h-5 text-burgundy mb-2" />
            <div className="text-sm text-charcoal/60 mb-1">Distance</div>
            <div className="font-medium text-charcoal">{distanceLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
