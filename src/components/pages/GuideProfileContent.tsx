import { useState, useEffect, useCallback } from 'react';
import { Target, MapPin, Camera, Star } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { GuideHeroSection } from '../guide/GuideHeroSection';
import { CredentialsSection } from '../guide/CredentialsSection';
import { GuideStatsCards } from '../guide/GuideStatsCards';
import { GuideSpecialties } from '../guide/GuideSpecialties';
import { GuidingAreasGrid } from '../guide/GuidingAreasGrid';
import { GuideActiveTours } from '../guide/GuideActiveTours';
import { GuideReviewsSection } from '../guide/GuideReviewsSection';

import { VideoIntroductionCard } from '../guide/VideoIntroductionCard';
import { EnhancedCalendarWidget } from '../guide/EnhancedCalendarWidget';
import { PhotoGalleryWithFilters } from '../guide/PhotoGalleryWithFilters';
import { LanguagesSection } from '../guide/LanguagesSection';
import { ReviewCategoryRatings } from '../guide/ReviewCategoryRatings';
import { SafetyInformationCard } from '../guide/SafetyInformationCard';
import { FAQAccordion } from '../guide/FAQAccordion';
import { TrustIndicatorsCard } from '../guide/TrustIndicatorsCard';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import type { GuideProfile, GuideStats } from '@/types/guide';
import type { Tour } from '@/types';
import type { GuideReview } from '@/hooks/useGuideReviews';
import type { Photo } from '../guide/PhotoGalleryWithFilters';

interface GuideProfileContentProps {
  guide: GuideProfile;
  stats: GuideStats;
  tours: Tour[];
  reviews: GuideReview[];
}

export function GuideProfileContent({ guide, stats, tours, reviews }: GuideProfileContentProps) {
  const { getImagesByGuide, getImageUrl } = useWebsiteImages();
  const [galleryPhotos, setGalleryPhotos] = useState<Photo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // Stable fetch function wrapped in useCallback
  const fetchGalleryImages = useCallback(async () => {
    // Prevent duplicate fetches
    if (hasFetched) return;
    
    setLoadingGallery(true);
    setHasFetched(true);
    
    try {
      const images = await getImagesByGuide(guide.user_id);
      
      // Map website_images to Photo format
      const photos: Photo[] = images.map(image => {
        // Determine gallery category from usage_context or category
        let category: Photo['category'] = 'all';
        
        if (image.usage_context?.includes('tour') || image.category === 'tour') {
          category = 'tours';
        } else if (image.category === 'landscape' || image.tags?.includes('landscape')) {
          category = 'landscapes';
        } else if (image.tags?.some(tag => tag.includes('group') || tag.includes('team'))) {
          category = 'groups';
        } else if (image.category === 'hiking' || image.tags?.includes('action')) {
          category = 'action';
        }
        
        return {
          url: getImageUrl(image),
          category,
          alt: image.alt_text || `${guide.display_name} adventure photo`
        };
      });
      
      setGalleryPhotos(photos);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setGalleryPhotos([]);
    } finally {
      setLoadingGallery(false);
    }
  }, [guide.user_id, guide.display_name, getImagesByGuide, getImageUrl, hasFetched]);

  // Only fetch once when guide.user_id changes
  useEffect(() => {
    setHasFetched(false);
  }, [guide.user_id]);

  useEffect(() => {
    fetchGalleryImages();
  }, [fetchGalleryImages]);

  const mockLanguages = guide.languages_spoken?.map(lang => ({
    language: lang,
    proficiency: 'Fluent' as const
  })) || [];

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
            {/* Credentials Section */}
            <CredentialsSection 
              certifications={guide.certifications}
              isGuideVerified={guide.verified}
            />

            {/* Combined About Me Card - Contains About, Specializations, Languages, Guiding Areas */}
            <Card className="border-burgundy/20 shadow-lg bg-white">
              <CardContent className="p-6 space-y-6">
                {/* About Me Section */}
                {guide.bio && (
                  <div>
                    <h2 className="text-2xl font-bold text-charcoal mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
                      About Me
                    </h2>
                    <p className="text-charcoal/80 leading-relaxed whitespace-pre-line">
                      {guide.bio}
                    </p>
                  </div>
                )}

                {/* Specializations */}
                {guide.specialties && guide.specialties.length > 0 && (
                  <>
                    <div className="border-t border-burgundy/10" />
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal/80 mb-4">
                        Specializations
                      </h3>
                      <GuideSpecialties specialties={guide.specialties} />
                    </div>
                  </>
                )}

                {/* Languages */}
                {mockLanguages.length > 0 && (
                  <>
                    <div className="border-t border-burgundy/10" />
                    <LanguagesSection languages={mockLanguages} />
                  </>
                )}

                {/* Guiding Areas */}
                {guide.guiding_areas && guide.guiding_areas.length > 0 && (
                  <>
                    <div className="border-t border-burgundy/10" />
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-burgundy" />
                        <h3 className="text-lg font-semibold text-charcoal/80">
                          Guiding Areas
                        </h3>
                      </div>
                      <GuidingAreasGrid areas={guide.guiding_areas} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Adventure Gallery - Separate Section */}
            {loadingGallery ? (
              <Card className="border-burgundy/20 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="h-5 w-5 text-burgundy" />
                    <h2 className="text-2xl font-bold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                      {guide.display_name.split(' ')[0]} - Adventure Gallery
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : galleryPhotos.length > 0 && (
              <Card className="border-burgundy/20 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="h-5 w-5 text-burgundy" />
                    <h2 className="text-2xl font-bold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                      {guide.display_name.split(' ')[0]} - Adventure Gallery
                    </h2>
                  </div>
                  <PhotoGalleryWithFilters 
                    photos={galleryPhotos} 
                    guideName={guide.display_name}
                  />
                </CardContent>
              </Card>
            )}

            {/* Active Tours */}
            <GuideActiveTours tours={tours} guideId={guide.user_id} />

            {/* Reviews with Rating Breakdown */}
            <GuideReviewsSection 
              reviews={reviews} 
              averageRating={stats.average_rating}
              totalReviews={reviews.length}
              ratings={stats.category_ratings}
            />

            {/* FAQs */}
            <FAQAccordion faqs={mockFAQs} />
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="lg:col-span-1">
            {/* Video Introduction */}
            <div className="mb-6">
              <VideoIntroductionCard 
                videoUrl={guide.intro_video_url}
                thumbnailUrl={
                  guide.intro_video_thumbnail_url || guide.profile_image_url
                }
                guideName={guide.display_name}
              />
            </div>

            {/* Calendar Widget & Trust Indicators - sticky container */}
            <div className="sticky top-24 space-y-6">
              <EnhancedCalendarWidget />
              
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

    </div>
  );
}
