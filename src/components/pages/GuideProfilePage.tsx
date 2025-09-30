import { MainLayout } from '../layout/MainLayout';
import { GuideProfileContent } from './GuideProfileContent';
import type { GuideProfile, GuideStats } from '@/types/guide';
import type { Tour } from '@/types';
import type { GuideReview } from '@/hooks/useGuideReviews';

interface GuideProfilePageProps {
  guide: GuideProfile;
  stats: GuideStats;
  tours: Tour[];
  reviews: GuideReview[];
}

export function GuideProfilePage({ guide, stats, tours, reviews }: GuideProfilePageProps) {
  return (
    <MainLayout>
      <GuideProfileContent 
        guide={guide}
        stats={stats}
        tours={tours}
        reviews={reviews}
      />
    </MainLayout>
  );
}
