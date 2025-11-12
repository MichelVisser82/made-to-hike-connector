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
      
      {/* Countdown Timer - No Card Box */}
      {isUpcoming && (
        <div className="bg-[#7c2843] text-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-sm font-medium mb-2">Your adventure starts in</div>
          <div className="text-6xl font-bold mb-1">{daysUntilTrip}</div>
          <div className="text-sm opacity-90">Days</div>
        </div>
      )}

      <TripPreparationCard tripDetails={tripDetails} />
    </div>
  );
}
