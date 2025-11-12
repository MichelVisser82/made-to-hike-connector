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
    <Tabs defaultValue="itinerary" className="space-y-6">
      <TabsList className="bg-white border border-burgundy/10 rounded-lg">
        <TabsTrigger value="itinerary">Day-by-Day Itinerary</TabsTrigger>
        <TabsTrigger value="checklist">Pre-Trip Checklist</TabsTrigger>
        <TabsTrigger value="logistics">Logistics & Meeting</TabsTrigger>
        <TabsTrigger value="inclusions">What's Included</TabsTrigger>
        <TabsTrigger value="policies">Policies</TabsTrigger>
      </TabsList>

      <TabsContent value="itinerary">
        <TripItineraryTab tripDetails={tripDetails} />
      </TabsContent>

      <TabsContent value="checklist">
        <TripChecklistTab tripDetails={tripDetails} />
      </TabsContent>

      <TabsContent value="logistics">
        <TripLogisticsTab tripDetails={tripDetails} />
      </TabsContent>

      <TabsContent value="inclusions">
        <TripInclusionsTab tripDetails={tripDetails} />
      </TabsContent>

      <TabsContent value="policies">
        <TripPoliciesTab tripDetails={tripDetails} />
      </TabsContent>
    </Tabs>
  );
}
