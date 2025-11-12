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
      <div className="min-h-screen bg-cream-light">
        <div className="max-w-7xl mx-auto px-6 py-8">
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 text-burgundy hover:bg-burgundy/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Trips
          </Button>
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-burgundy/10">
            <p className="text-charcoal/70">Failed to load trip details. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Header */}
      <div className="bg-white border-b border-burgundy/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="text-burgundy hover:bg-burgundy/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Trips
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="border-burgundy/30 text-burgundy hover:bg-burgundy/5">
                <FileDown className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
