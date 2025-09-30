import { useGuideProfile } from '@/hooks/useGuideProfile';
import { useGuideStats } from '@/hooks/useGuideStats';
import { useGuideTours } from '@/hooks/useGuideTours';
import { useGuideReviews } from '@/hooks/useGuideReviews';
import { GuideProfileContent } from './GuideProfileContent';
import { Loader2 } from 'lucide-react';

interface GuideProfilePageWrapperProps {
  guideId: string;
  onNavigateBack?: () => void;
}

export function GuideProfilePageWrapper({ guideId }: GuideProfilePageWrapperProps) {
  const { data: guide, isLoading: guideLoading } = useGuideProfile(guideId);
  const { data: stats, isLoading: statsLoading } = useGuideStats(guideId);
  const { data: tours = [], isLoading: toursLoading } = useGuideTours(guideId);
  const { data: reviews = [], isLoading: reviewsLoading } = useGuideReviews(guideId);

  const isLoading = guideLoading || statsLoading || toursLoading || reviewsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!guide || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground mb-4">Guide profile not found</p>
      </div>
    );
  }

  return (
    <GuideProfileContent
      guide={guide}
      stats={stats}
      tours={tours}
      reviews={reviews}
    />
  );
}
