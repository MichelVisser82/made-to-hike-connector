import { GuideHeroSection } from '../guide/GuideHeroSection';
import { ProfessionalExpertise } from '../guide/ProfessionalExpertise';
import { GuideCertificationCard } from '../guide/GuideCertificationCard';
import { GuideStatsCards } from '../guide/GuideStatsCards';
import { GuideSpecialties } from '../guide/GuideSpecialties';
import { GuidingAreasGrid } from '../guide/GuidingAreasGrid';
import { GuideActiveTours } from '../guide/GuideActiveTours';
import { GuideReviewsSection } from '../guide/GuideReviewsSection';
import { GuideAvailabilityCard } from '../guide/GuideAvailabilityCard';
import { GuideFooterCTA } from '../guide/GuideFooterCTA';
import { VideoIntroductionCard } from '../guide/VideoIntroductionCard';
import { EnhancedCalendarWidget } from '../guide/EnhancedCalendarWidget';
import { PhotoGalleryWithFilters } from '../guide/PhotoGalleryWithFilters';
import { LanguagesSection } from '../guide/LanguagesSection';
import { ReviewCategoryRatings } from '../guide/ReviewCategoryRatings';
import { SafetyInformationCard } from '../guide/SafetyInformationCard';
import { FAQAccordion } from '../guide/FAQAccordion';
import { TrustIndicatorsCard } from '../guide/TrustIndicatorsCard';
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
  // Mock data for new components - replace with real data from API
  const mockPhotos = guide.portfolio_images?.map((img, idx) => ({
    url: typeof img === 'string' ? img : '',
    category: ['tours', 'landscapes', 'groups', 'action'][idx % 4] as 'tours' | 'landscapes' | 'groups' | 'action',
    alt: `${guide.display_name} tour photo ${idx + 1}`
  })) || [];

  const mockLanguages = guide.languages_spoken?.map(lang => ({
    language: lang,
    proficiency: 'Fluent' as const
  })) || [];

  const mockReviewRatings = {
    safety: 4.9,
    knowledge: 4.8,
    communication: 4.9,
    value: 4.7
  };

  const mockFAQs = [
    {
      question: 'What is your cancellation policy?',
      answer: 'Cancellations made 7+ days before the tour receive a full refund. Cancellations made 3-6 days before receive 50% refund. No refund for cancellations within 48 hours.'
    },
    {
      question: 'What fitness level is required?',
      answer: 'Fitness requirements vary by tour. Please check individual tour descriptions for specific requirements. I can also customize tours to match your fitness level.'
    },
    {
      question: 'What equipment do I need to bring?',
      answer: 'I provide all technical equipment. You need appropriate hiking boots, weather-appropriate clothing, and personal items. A detailed packing list is sent upon booking.'
    },
    {
      question: 'Do you offer private tours?',
      answer: 'Yes! Private tours can be arranged for individuals, families, or groups. Contact me directly to discuss your requirements and availability.'
    }
  ];

  return (
    <div className="bg-cream-light min-h-screen">
      {/* Hero Section */}
      <GuideHeroSection guide={guide} stats={stats} />

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Me Section */}
            {guide.bio && (
              <section>
                <h2 className="text-3xl font-bold mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
                  About Me
                </h2>
                <p className="text-charcoal/80 leading-relaxed whitespace-pre-line">
                  {guide.bio}
                </p>
              </section>
            )}

            {/* Photo Gallery */}
            {mockPhotos.length > 0 && (
              <PhotoGalleryWithFilters 
                photos={mockPhotos} 
                guideName={guide.display_name}
              />
            )}

            {/* Specialties */}
            {guide.specialties && guide.specialties.length > 0 && (
              <GuideSpecialties specialties={guide.specialties} />
            )}

            {/* Certifications */}
            <section>
              <h2 className="text-3xl font-bold mb-6" style={{fontFamily: 'Playfair Display, serif'}}>
                Professional Certifications
              </h2>
              <GuideCertificationCard certifications={guide.certifications} />
            </section>

            {/* Languages */}
            {mockLanguages.length > 0 && (
              <LanguagesSection languages={mockLanguages} />
            )}

            {/* Stats Cards */}
            <GuideStatsCards stats={stats} />

            {/* Guiding Areas */}
            {guide.guiding_areas && guide.guiding_areas.length > 0 && (
              <GuidingAreasGrid areas={guide.guiding_areas} />
            )}

            {/* Terrain Capabilities */}
            {guide.terrain_capabilities && guide.terrain_capabilities.length > 0 && (
              <GuideSpecialties 
                specialties={guide.terrain_capabilities} 
                title="Terrain Capabilities" 
              />
            )}

            {/* Active Tours */}
            <GuideActiveTours tours={tours} guideId={guide.user_id} />

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <section>
                <ReviewCategoryRatings ratings={mockReviewRatings} />
                <GuideReviewsSection 
                  reviews={reviews} 
                  averageRating={stats.average_rating}
                  totalReviews={reviews.length}
                />
              </section>
            )}

            {/* Safety Information */}
            <SafetyInformationCard safetyRecord="Zero incidents in 450+ tours" />

            {/* FAQs */}
            <FAQAccordion faqs={mockFAQs} />
          </div>

          {/* Sidebar Column (1/3 width, sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Video Introduction */}
              <VideoIntroductionCard 
                videoUrl={guide.hero_background_url}
                thumbnailUrl={guide.hero_background_url}
                guideName={guide.display_name}
              />

              {/* Calendar Widget */}
              <EnhancedCalendarWidget />

              {/* Trust Indicators */}
              <TrustIndicatorsCard 
                guideName={guide.display_name}
                isVerified={guide.verified}
                averageRating={stats.average_rating}
                totalReviews={reviews.length}
                totalClients={stats.total_hikers}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <GuideFooterCTA guide={guide} />
    </div>
  );
}
