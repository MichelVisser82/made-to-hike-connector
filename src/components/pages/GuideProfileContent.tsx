import { GuideHeroSection } from '../guide/GuideHeroSection';
import { ProfessionalExpertise } from '../guide/ProfessionalExpertise';
import { GuideStatsCards } from '../guide/GuideStatsCards';
import { GuideSpecialties } from '../guide/GuideSpecialties';
import { GuidingAreasGrid } from '../guide/GuidingAreasGrid';
import { GuideActiveTours } from '../guide/GuideActiveTours';
import { GuideReviewsSection } from '../guide/GuideReviewsSection';
import { GuidePortfolioGallery } from '../guide/GuidePortfolioGallery';
import { GuideAvailabilityCard } from '../guide/GuideAvailabilityCard';
import { GuideFooterCTA } from '../guide/GuideFooterCTA';
import type { GuideProfile, GuideStats } from '@/types/guide';
import type { Tour } from '@/types';
import type { GuideReview } from '@/hooks/useGuideReviews';

interface GuideProfileContentProps {
  guide: GuideProfile;
  stats: GuideStats;
  tours: Tour[];
  reviews: GuideReview[];
}

export function GuideProfileContent({ guide, stats, tours, reviews }: GuideProfileContentProps) {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <GuideHeroSection guide={guide} stats={stats} />

      {/* Content Container */}
      <div className="container mx-auto px-4">
        {/* Professional Expertise */}
        <ProfessionalExpertise certifications={guide.certifications} />

        {/* Stats Cards */}
        <GuideStatsCards stats={stats} />

        {/* Specialties */}
        <GuideSpecialties specialties={guide.specialties} />

        {/* Guiding Areas */}
        <GuidingAreasGrid areas={guide.guiding_areas} />

        {/* Terrain Capabilities */}
        <GuideSpecialties 
          specialties={guide.terrain_capabilities} 
          title="Terrain Capabilities" 
        />

        {/* Active Tours */}
        <GuideActiveTours tours={tours} guideId={guide.user_id} />

        {/* Reviews */}
        <GuideReviewsSection 
          reviews={reviews} 
          averageRating={stats.average_rating}
          totalReviews={reviews.length}
        />

        {/* Portfolio Gallery */}
        <GuidePortfolioGallery images={guide.portfolio_images} />

        {/* Availability */}
        <GuideAvailabilityCard guide={guide} />
      </div>

      {/* Footer CTA */}
      <GuideFooterCTA guide={guide} />
    </div>
  );
}
