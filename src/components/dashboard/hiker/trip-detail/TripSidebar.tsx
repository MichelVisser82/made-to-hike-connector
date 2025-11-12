import { TripGuideCard } from './TripGuideCard';
import { TripPreparationCard } from './TripPreparationCard';
import { Card, CardContent } from '@/components/ui/card';
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
      
      {/* Countdown Timer Card */}
      {isUpcoming && (
        <Card className="bg-[#7c2843] text-white border-[#7c2843]">
          <CardContent className="p-6 text-center">
            <div className="text-sm font-medium mb-2">Your adventure starts in</div>
            <div className="text-6xl font-bold mb-1">{daysUntilTrip}</div>
            <div className="text-sm opacity-90">Days</div>
          </CardContent>
        </Card>
      )}

      <TripPreparationCard tripDetails={tripDetails} />
    </div>
  );
}
