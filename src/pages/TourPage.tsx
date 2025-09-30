import { useParams, useNavigate } from 'react-router-dom';
import { useTourBySlug } from '@/hooks/useTourBySlug';
import { TourDetailPage } from '@/components/pages/TourDetailPage';
import { TourSEO } from '@/components/seo/TourSEO';
import { StructuredData } from '@/components/seo/StructuredData';
import { Loader2 } from 'lucide-react';

export default function TourPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: tour, isLoading, error } = useTourBySlug(slug);

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
      <TourDetailPage
        tour={tour}
        onBookTour={(selectedTour) => {
          console.log('Booking tour:', selectedTour.id);
          // Handle booking navigation
          navigate('/booking', { state: { tour: selectedTour } });
        }}
        onBackToSearch={() => navigate('/')}
      />
    </>
  );
}
