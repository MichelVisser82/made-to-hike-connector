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
      <TabsList className="grid w-full grid-cols-5 h-auto border-b border-gray-200 bg-transparent rounded-none p-0">
        <TabsTrigger 
          value="itinerary" 
          className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7c2843] data-[state=active]:text-[#7c2843] rounded-none py-3 px-4 text-gray-600"
        >
          Day-by-Day Itinerary
        </TabsTrigger>
        <TabsTrigger 
          value="checklist" 
          className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7c2843] data-[state=active]:text-[#7c2843] rounded-none py-3 px-4 text-gray-600"
        >
          Pre-Trip Checklist
        </TabsTrigger>
        <TabsTrigger 
          value="logistics" 
          className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7c2843] data-[state=active]:text-[#7c2843] rounded-none py-3 px-4 text-gray-600"
        >
          Logistics & Meeting
        </TabsTrigger>
        <TabsTrigger 
          value="inclusions" 
          className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7c2843] data-[state=active]:text-[#7c2843] rounded-none py-3 px-4 text-gray-600"
        >
          What's Included
        </TabsTrigger>
        <TabsTrigger 
          value="policies" 
          className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7c2843] data-[state=active]:text-[#7c2843] rounded-none py-3 px-4 text-gray-600"
        >
          Policies
        </TabsTrigger>
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
