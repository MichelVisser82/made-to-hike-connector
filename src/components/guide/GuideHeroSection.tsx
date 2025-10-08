import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Star, Users, Clock, Award, MessageCircle, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import type { GuideProfile } from '@/types/guide';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';

interface GuideHeroSectionProps {
  guide: GuideProfile;
  stats: {
    tours_completed: number;
    average_rating: number;
  };
}

export function GuideHeroSection({ guide, stats }: GuideHeroSectionProps) {
  const [fallbackHeroUrl, setFallbackHeroUrl] = useState<string | null>(null);
  const { fetchImages, getImageUrl } = useWebsiteImages();

  const activeSinceYear = guide.active_since 
    ? new Date(guide.active_since).getFullYear()
    : new Date().getFullYear();
  
  const experienceYears = guide.experience_years || (new Date().getFullYear() - activeSinceYear);
  const reviewCount = 156; // This should come from actual review count
  const responseTime = '2 hours'; // This should come from guide data

  useEffect(() => {
    const loadFallbackImage = async () => {
      if (!guide.hero_background_url) {
        // Fetch images from website_images table for this guide
        const guideImages = await fetchImages({ guide_id: guide.user_id });
        
        if (guideImages && guideImages.length > 0) {
          // Prioritize hero images, then landscapes, then any image
          const heroImages = guideImages.filter(img => 
            img.category === 'hero' || img.usage_context?.includes('hero')
          );
          const landscapeImages = guideImages.filter(img => 
            img.category === 'landscape' || img.usage_context?.includes('landscape')
          );
          
          const imageToUse = heroImages[0] || landscapeImages[0] || guideImages[0];
          const imageUrl = getImageUrl(imageToUse);
          setFallbackHeroUrl(imageUrl);
        }
      }
    };

    loadFallbackImage();
  }, [guide.hero_background_url, guide.user_id, fetchImages, getImageUrl]);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero Background - Fixed height only on desktop */}
      <div 
        className="absolute inset-0 lg:h-[480px] bg-cover bg-center"
        style={{
          backgroundImage: guide.hero_background_url 
            ? `url(${guide.hero_background_url})` 
            : fallbackHeroUrl
            ? `url(${fallbackHeroUrl})`
            : 'linear-gradient(135deg, #1a4d2e 0%, #2d5f3e 25%, #4a7c59 50%, #6b9377 75%, #8ba888 100%)',
        }}
      >
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 md:h-56 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-8 lg:py-0 lg:min-h-[480px]">
        <div className="lg:h-full lg:flex lg:items-end lg:justify-between lg:gap-8">
          {/* Main Content - Flex Layout */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start lg:items-end lg:flex-1">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44">
                <img
                  src={guide.profile_image_url || 'https://via.placeholder.com/176'}
                  alt={guide.display_name}
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-2xl"
                />
                {guide.verified && (
                  <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-burgundy rounded-full p-1.5 md:p-2 shadow-lg border-2 md:border-3 border-white">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Guide Info - Center Content */}
            <div className="flex-1 text-center md:text-left lg:pb-2">
              {/* Name */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-1 md:mb-2 leading-tight" style={{fontFamily: 'Playfair Display, serif'}}>
                {guide.display_name}
              </h1>

              {/* Subtitle */}
              <p className="text-white text-sm sm:text-base mb-2 md:mb-3">
                Certified Mountain Guide · {experienceYears} Years Experience
              </p>

              {/* Location */}
              {guide.location && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90 text-xs sm:text-sm mb-4 md:mb-8">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{guide.location}</span>
                </div>
              )}

              {/* Stats Bar - Mobile: Grid Layout | Desktop: Inline */}
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center md:justify-start sm:gap-3 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-full px-4 py-3 sm:px-6 sm:py-2.5 shadow-lg max-w-md sm:max-w-none mx-auto md:mx-0">
                {/* Rating */}
                <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold fill-gold flex-shrink-0" />
                  <span className="font-bold text-charcoal text-sm sm:text-base">{stats.average_rating.toFixed(1)}</span>
                  <span className="text-charcoal/60 text-xs hidden sm:inline">({reviewCount})</span>
                </div>

                <div className="hidden sm:block w-px h-5 bg-charcoal/20" />

                {/* Tours */}
                <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-burgundy flex-shrink-0" />
                  <span className="font-bold text-charcoal text-sm sm:text-base">{stats.tours_completed}+</span>
                  <span className="text-charcoal/60 text-xs">tours</span>
                </div>

                <div className="hidden sm:block w-px h-5 bg-charcoal/20" />

                {/* Response Time */}
                <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-burgundy flex-shrink-0" />
                  <span className="font-bold text-charcoal text-sm sm:text-base">{responseTime}</span>
                  <span className="text-charcoal/60 text-xs hidden sm:inline">response</span>
                </div>

                <div className="hidden sm:block w-px h-5 bg-charcoal/20" />

                {/* Experience */}
                <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-burgundy flex-shrink-0" />
                  <span className="font-bold text-charcoal text-sm sm:text-base">{experienceYears}</span>
                  <span className="text-charcoal/60 text-xs">years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card - Floating on Desktop, aligned to bottom */}
          <Card className="hidden lg:block lg:flex-shrink-0 lg:w-72 lg:mb-2 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl p-5">
            <h3 className="text-xl font-semibold text-charcoal mb-4">
              Contact {guide.display_name.split(' ')[0]}
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-charcoal/70">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Responds within 2 hours</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">99% response rate</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-burgundy hover:bg-burgundy/90 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full border-burgundy text-burgundy hover:bg-burgundy/10">
                <Mail className="w-4 h-4 mr-2" />
                Request Custom Tour
              </Button>
            </div>
          </Card>
        </div>

        {/* Contact Card - Mobile/Tablet */}
        <Card className="lg:hidden mt-6 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-charcoal mb-3 sm:mb-4">
            Contact {guide.display_name.split(' ')[0]}
          </h3>
          
          <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6">
            <div className="flex items-center gap-2 text-charcoal/70">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Responds within 2 hours</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">99% response rate</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Button className="w-full bg-burgundy hover:bg-burgundy/90 text-white text-sm sm:text-base py-2.5 sm:py-3">
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full border-burgundy text-burgundy hover:bg-burgundy/10 text-sm sm:text-base py-2.5 sm:py-3">
              <Mail className="w-4 h-4 mr-2" />
              Request Custom Tour
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
