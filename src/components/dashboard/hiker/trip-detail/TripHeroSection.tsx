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
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-medium">Confirmed</Badge>;
    }
    if (booking.status === 'pending') {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 font-medium">Action Needed</Badge>;
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
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80">
        {tour.hero_image ? (
          <img
            src={tour.hero_image}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50" />
        )}
        {/* Status Badge - Top Left */}
        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>
        {/* Wishlist Heart - Top Right */}
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4 bg-white/95 hover:bg-white backdrop-blur-sm rounded-full w-10 h-10 shadow-sm"
        >
          <Heart className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* Title Section - Clean, no border */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-playfair font-semibold mb-2 text-gray-900">{tour.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{tour.meeting_point || tour.region || 'Chamonix, France'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>October 16-17, 2025</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#7c2843]">
              {getCurrencySymbol(booking.currency)}{booking.total_price}
            </div>
            <div className="text-xs text-gray-500">per person</div>
          </div>
        </div>
      </div>

      {/* Stats Row with Dividers - Clean styling */}
      <div className="border-t border-gray-100">
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          <div className="px-4 py-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div className="text-xs text-gray-500">Difficulty</div>
              <div className="text-sm font-semibold text-gray-900 capitalize">{tour.difficulty || 'Advanced'}</div>
            </div>
          </div>
          <div className="px-4 py-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="text-xs text-gray-500">Duration</div>
              <div className="text-sm font-semibold text-gray-900">{tour.duration || '3 Days'}</div>
            </div>
          </div>
          <div className="px-4 py-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Users className="w-5 h-5 text-gray-400" />
              <div className="text-xs text-gray-500">Group Size</div>
              <div className="text-sm font-semibold text-gray-900">{booking.participants} Guests</div>
            </div>
          </div>
          <div className="px-4 py-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Mountain className="w-5 h-5 text-gray-400" />
              <div className="text-xs text-gray-500">Max Altitude</div>
              <div className="text-sm font-semibold text-gray-900">4,808m</div>
            </div>
          </div>
        </div>
      </div>

      {/* Waiver Alert Banner */}
      {!booking.waiver_uploaded_at && (
        <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-yellow-800 font-semibold">!</span>
            </div>
            <span className="font-medium text-yellow-900">Waiver document required</span>
          </div>
        </div>
      )}
    </div>
  );
}
