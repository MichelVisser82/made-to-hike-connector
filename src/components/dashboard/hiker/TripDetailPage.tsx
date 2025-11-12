import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTripDetails } from '@/hooks/useTripDetails';
import { TripHeroSection } from './trip-detail/TripHeroSection';
import { TripSidebar } from './trip-detail/TripSidebar';
import { TripTabContent } from './trip-detail/TripTabContent';
import { Skeleton } from '@/components/ui/skeleton';

export function TripDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { data: tripDetails, isLoading, error } = useTripDetails(bookingId);

  const handleBack = () => {
    navigate('/dashboard?section=my-trips');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto py-8 px-4 md:px-6">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tripDetails) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto py-8 px-4 md:px-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Trips
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load trip details. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto py-8 px-4 md:px-6">
        {/* Header with Back Button and Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="hover:bg-white text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Trips
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="bg-white">
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <TripHeroSection tripDetails={tripDetails} />
            <TripTabContent tripDetails={tripDetails} />
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <TripSidebar tripDetails={tripDetails} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
