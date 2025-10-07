import { User, Target, MapPin, Camera } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { GuideHeroSection } from '../guide/GuideHeroSection';
import { CredentialsSection } from '../guide/CredentialsSection';
import { GuideStatsCards } from '../guide/GuideStatsCards';
import { GuideSpecialties } from '../guide/GuideSpecialties';
import { GuidingAreasGrid } from '../guide/GuidingAreasGrid';
import { GuideActiveTours } from '../guide/GuideActiveTours';
import { GuideReviewsSection } from '../guide/GuideReviewsSection';
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
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <GuideHeroSection guide={guide} stats={stats} />

      {/* Main Content - Two Column Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Me Section */}
            {guide.bio && (
              <Card className="border-burgundy/20 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-burgundy" />
                    <h2 className="text-2xl font-semibold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                      About Me
                    </h2>
                  </div>
                  <p className="text-charcoal/80 leading-relaxed whitespace-pre-line">
                    {guide.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Credentials Section */}
            <CredentialsSection 
              certifications={guide.certifications}
              isGuideVerified={guide.verified}
            />

            {/* Languages */}
            {mockLanguages.length > 0 && (
              <LanguagesSection languages={mockLanguages} />
            )}

            {/* Specialties */}
            {guide.specialties && guide.specialties.length > 0 && (
              <Card className="border-burgundy/20 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-burgundy" />
                    <h2 className="text-2xl font-semibold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                      Specialties
                    </h2>
                  </div>
                  <GuideSpecialties specialties={guide.specialties} />
                </CardContent>
              </Card>
            )}

            {/* Guiding Areas */}
            {guide.guiding_areas && guide.guiding_areas.length > 0 && (
              <Card className="border-burgundy/20 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-burgundy" />
                    <h2 className="text-2xl font-semibold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                      Guiding Areas
                    </h2>
                  </div>
                  <GuidingAreasGrid areas={guide.guiding_areas} />
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery */}
            {mockPhotos.length > 0 && (
              <Card className="border-burgundy/20 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="h-5 w-5 text-burgundy" />
                    <h2 className="text-2xl font-semibold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                      {guide.display_name}'s Adventure Gallery
                    </h2>
                  </div>
                  <PhotoGalleryWithFilters 
                    photos={mockPhotos} 
                    guideName={guide.display_name}
                  />
                </CardContent>
              </Card>
            )}

            {/* Active Tours */}
            <GuideActiveTours tours={tours} guideId={guide.user_id} />

            {/* Reviews with Rating Breakdown */}
            {reviews && reviews.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                  Reviews & Testimonials
                </h2>
                <ReviewCategoryRatings ratings={mockReviewRatings} />
                <GuideReviewsSection 
                  reviews={reviews} 
                  averageRating={stats.average_rating}
                  totalReviews={reviews.length}
                />
              </section>
            )}

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
