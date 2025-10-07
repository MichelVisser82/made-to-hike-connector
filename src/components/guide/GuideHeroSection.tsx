import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Star, Users, Clock, Award, Heart, Share2, MessageCircle, Mail } from 'lucide-react';
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
    <section className="relative h-[600px] w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Main Content */}
          <div className="flex gap-8 items-center">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48">
                <img
                  src={guide.profile_image_url || 'https://via.placeholder.com/192'}
                  alt={guide.display_name}
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-2xl"
                />
                {guide.verified && (
                  <div className="absolute bottom-2 right-2 bg-burgundy rounded-full p-2.5 shadow-lg border-4 border-white">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Guide Info */}
            <div className="flex-1">
              {/* Name and Actions */}
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-5xl lg:text-6xl font-serif text-white">{guide.display_name}</h1>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="rounded-lg border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-lg border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-white text-xl mb-3">
                Certified Mountain Guide - {experienceYears} Years Experience
              </p>

              {/* Location */}
              {guide.location && (
                <div className="flex items-center gap-2 text-white/90 text-lg mb-6">
                  <MapPin className="w-5 h-5" />
                  <span>{guide.location}</span>
                </div>
              )}

              {/* Stats Card */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl p-6 max-w-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-gold fill-gold flex-shrink-0" />
                    <div>
                      <div className="text-charcoal font-semibold text-lg">
                        {stats.average_rating.toFixed(1)}
                      </div>
                      <div className="text-charcoal/60 text-sm">({reviewCount} reviews)</div>
                    </div>
                  </div>

                  {/* Tours */}
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-burgundy flex-shrink-0" />
                    <div>
                      <div className="text-charcoal font-semibold text-lg">
                        {stats.tours_completed}+
                      </div>
                      <div className="text-charcoal/60 text-sm">tours</div>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-burgundy flex-shrink-0" />
                    <div>
                      <div className="text-charcoal font-semibold text-lg">{responseTime}</div>
                      <div className="text-charcoal/60 text-sm">response</div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-burgundy flex-shrink-0" />
                    <div>
                      <div className="text-charcoal font-semibold text-lg">
                        {experienceYears} years
                      </div>
                      <div className="text-charcoal/60 text-sm">experience</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl p-6 w-full lg:w-80">
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
      </div>
    </section>
  );
}
