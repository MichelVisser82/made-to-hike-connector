import { useParams, useNavigate } from 'react-router-dom';
import { useTourBySlug } from '@/hooks/useTourBySlug';
import { TourDetailPage } from '@/components/pages/TourDetailPage';
import { TourSEO } from '@/components/seo/TourSEO';
import { StructuredData } from '@/components/seo/StructuredData';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';
import type { DashboardMode } from '@/types/dashboard';

export default function TourPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { data: tour, isLoading: tourLoading, error } = useTourBySlug(slug);
  
  // Determine dashboard mode based on user role
  const dashboardMode: DashboardMode = user && profile 
    ? (profile.role as DashboardMode)
    : null;

  const isLoading = tourLoading || (user && profileLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Tour Not Found</h1>
        <p className="text-muted-foreground">
          The tour you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <>
      <TourSEO tour={tour} />
      <StructuredData tour={tour} />
      <MainLayout dashboardMode={dashboardMode}>
        <TourDetailPage
          tour={tour}
          onBookTour={(selectedTour, selectedSlotId) => {
            console.log('Booking tour:', selectedTour.id);
            const bookingUrl = selectedSlotId 
              ? `/tours/${selectedTour.slug}/book?slotId=${selectedSlotId}`
              : `/tours/${selectedTour.slug}/book`;
            navigate(bookingUrl);
          }}
          onBackToSearch={() => navigate('/')}
        />
      </MainLayout>
    </>
  );
}
