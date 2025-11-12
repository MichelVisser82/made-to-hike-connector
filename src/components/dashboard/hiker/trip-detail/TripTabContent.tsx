import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripItineraryTab } from './tabs/TripItineraryTab';
import { TripChecklistTab } from './tabs/TripChecklistTab';
import { TripLogisticsTab } from './tabs/TripLogisticsTab';
import { TripInclusionsTab } from './tabs/TripInclusionsTab';
import { TripPoliciesTab } from './tabs/TripPoliciesTab';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripTabContentProps {
  tripDetails: TripDetails;
}

export function TripTabContent({ tripDetails }: TripTabContentProps) {
  return (
    <Tabs defaultValue="itinerary" className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-auto">
        <TabsTrigger value="itinerary" className="text-xs sm:text-sm">Day-by-Day</TabsTrigger>
        <TabsTrigger value="checklist" className="text-xs sm:text-sm">Pre-Trip</TabsTrigger>
        <TabsTrigger value="logistics" className="text-xs sm:text-sm">Logistics</TabsTrigger>
        <TabsTrigger value="inclusions" className="text-xs sm:text-sm">What's Included</TabsTrigger>
        <TabsTrigger value="policies" className="text-xs sm:text-sm">Policies</TabsTrigger>
      </TabsList>

      <TabsContent value="itinerary" className="mt-6">
        <TripItineraryTab tripDetails={tripDetails} />
      </TabsContent>

      <TabsContent value="checklist" className="mt-6">
        <TripChecklistTab tripDetails={tripDetails} />
      </TabsContent>

      <TabsContent value="logistics" className="mt-6">
        <TripLogisticsTab tripDetails={tripDetails} />
      </TabsContent>

      <TabsContent value="inclusions" className="mt-6">
        <TripInclusionsTab tripDetails={tripDetails} />
      </TabsContent>

      <TabsContent value="policies" className="mt-6">
        <TripPoliciesTab tripDetails={tripDetails} />
      </TabsContent>
    </Tabs>
  );
}
