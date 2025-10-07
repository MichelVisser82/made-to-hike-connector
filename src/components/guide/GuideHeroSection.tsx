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
    <section className="relative h-[550px] w-full overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: guide.hero_background_url 
            ? `url(${guide.hero_background_url})` 
            : fallbackHeroUrl
            ? `url(${fallbackHeroUrl})`
            : 'linear-gradient(135deg, #1a4d2e 0%, #2d5f3e 25%, #4a7c59 50%, #6b9377 75%, #8ba888 100%)',
        }}
      >
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-cream" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4">
        <div className="h-full flex items-center">
          {/* Main Content - Flex Layout */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start w-full">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative w-60 h-60">
                <img
                  src={guide.profile_image_url || 'https://via.placeholder.com/240'}
                  alt={guide.display_name}
                  className="w-full h-full rounded-full object-cover border-6 border-white shadow-2xl"
                />
                {guide.verified && (
                  <div className="absolute bottom-3 right-3 bg-burgundy rounded-full p-3 shadow-lg border-4 border-white">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Guide Info - Center Content */}
            <div className="flex-1">
              {/* Name */}
              <h1 className="text-6xl lg:text-7xl font-serif text-white mb-2">{guide.display_name}</h1>

              {/* Subtitle */}
              <p className="text-white text-xl mb-3">
                Certified Mountain Guide · {experienceYears} Years Experience
              </p>

              {/* Location */}
              {guide.location && (
                <div className="flex items-center gap-2 text-white/90 text-lg mb-8">
                  <MapPin className="w-5 h-5" />
                  <span>{guide.location}</span>
                </div>
              )}

              {/* Stats Bar - Inline Pill Design */}
              <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-md rounded-full px-8 py-4 shadow-xl">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span className="font-bold text-charcoal text-lg">{stats.average_rating.toFixed(1)}</span>
                  <span className="text-charcoal/60 text-sm">({reviewCount})</span>
                </div>

                <div className="w-px h-6 bg-charcoal/20" />

                {/* Tours */}
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-burgundy" />
                  <span className="font-bold text-charcoal text-lg">{stats.tours_completed}+</span>
                  <span className="text-charcoal/60 text-sm">tours</span>
                </div>

                <div className="w-px h-6 bg-charcoal/20" />

                {/* Response Time */}
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-burgundy" />
                  <span className="font-bold text-charcoal text-lg">{responseTime}</span>
                  <span className="text-charcoal/60 text-sm">response</span>
                </div>

                <div className="w-px h-6 bg-charcoal/20" />

                {/* Experience */}
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-burgundy" />
                  <span className="font-bold text-charcoal text-lg">{experienceYears}</span>
                  <span className="text-charcoal/60 text-sm">years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card - Floating on Desktop */}
          <Card className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-6 w-80">
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
        <Card className="lg:hidden mt-8 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl p-6">
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
    </section>
  );
}
