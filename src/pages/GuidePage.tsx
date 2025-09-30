import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useGuideProfile } from '@/hooks/useGuideProfile';
import { useGuideStats } from '@/hooks/useGuideStats';
import { useGuideTours } from '@/hooks/useGuideTours';
import { useGuideReviews } from '@/hooks/useGuideReviews';
import { GuideProfilePage } from '@/components/pages/GuideProfilePage';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function GuidePage() {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  
  const { data: guide, isLoading: guideLoading, error: guideError } = useGuideProfile(guideId);
  const { data: stats, isLoading: statsLoading } = useGuideStats(guideId);
  const { data: tours = [], isLoading: toursLoading } = useGuideTours(guideId, 3);
  const { data: reviews = [], isLoading: reviewsLoading } = useGuideReviews(guideId, 3);

  // Update document title
  useEffect(() => {
    if (guide) {
      document.title = `${guide.display_name} | Certified Mountain Guide | MadeToHike`;
      
      // Meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          guide.bio 
            ? `${guide.bio.slice(0, 150)}... | ${guide.location || 'Mountain Guide'}`
            : `Certified mountain guide ${guide.display_name}. Specializing in ${guide.specialties.join(', ')}.`
        );
      }
    }
  }, [guide]);

  if (guideLoading || statsLoading || toursLoading || reviewsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (guideError || !guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-4xl font-bold">Guide Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          The guide profile you're looking for doesn't exist or is not yet verified.
        </p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <GuideProfilePage 
      guide={guide}
      stats={stats}
      tours={tours}
      reviews={reviews}
    />
  );
}
