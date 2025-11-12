import { TripGuideCard } from './TripGuideCard';
import { TripPreparationCard } from './TripPreparationCard';
import { differenceInDays } from 'date-fns';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripSidebarProps {
  tripDetails: TripDetails;
}

export function TripSidebar({ tripDetails }: TripSidebarProps) {
  const { booking } = tripDetails;
  const daysUntilTrip = differenceInDays(new Date(booking.booking_date), new Date());
  const isUpcoming = daysUntilTrip >= 0;

  return (
    <div className="space-y-6">
      <TripGuideCard tripDetails={tripDetails} />
      
      {/* Countdown Timer */}
      {isUpcoming && (
        <div className="p-6 bg-gradient-to-br from-burgundy to-burgundy-dark text-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-sm opacity-90 mb-2">Your adventure starts in</div>
            <div className="text-5xl mb-1 font-playfair">{daysUntilTrip}</div>
            <div className="text-sm opacity-90">Days</div>
          </div>
        </div>
      )}

      <TripPreparationCard tripDetails={tripDetails} />
    </div>
  );
}
