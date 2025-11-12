import { TripGuideCard } from './TripGuideCard';
import { TripPreparationCard } from './TripPreparationCard';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripSidebarProps {
  tripDetails: TripDetails;
}

export function TripSidebar({ tripDetails }: TripSidebarProps) {
  return (
    <div className="space-y-6">
      <TripGuideCard tripDetails={tripDetails} />
      <TripPreparationCard tripDetails={tripDetails} />
    </div>
  );
}
