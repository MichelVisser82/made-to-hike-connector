import { MapPin, CheckCircle, MessageCircle, Calendar, Share2, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CertificationBadge } from '../ui/certification-badge';
import { getPrimaryCertification } from '@/utils/guideDataUtils';
import type { GuideProfile } from '@/types/guide';

interface GuideHeroSectionProps {
  guide: GuideProfile;
  stats: {
    tours_completed: number;
    average_rating: number;
  };
}

export function GuideHeroSection({ guide, stats }: GuideHeroSectionProps) {
  const activeSinceYear = guide.active_since 
    ? new Date(guide.active_since).getFullYear()
    : new Date().getFullYear();
  
  const primaryCert = getPrimaryCertification(guide.certifications);

  return (
    <section className="relative h-[500px] w-full overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: guide.hero_background_url 
            ? `url(${guide.hero_background_url})` 
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-12">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <img
                src={guide.profile_image_url || 'https://via.placeholder.com/160'}
                alt={guide.display_name}
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-elegant"
              />
              {guide.verified && (
                <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-glow">
                  <CheckCircle className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Guide Info */}
          <div className="flex-1 text-white">
            {/* Name and Rating */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold">{guide.display_name}</h1>
              {primaryCert && (
                <CertificationBadge
                  certification={primaryCert}
                  size="hero"
                  showAbbreviated
                  showTooltip
                  isGuideVerified={guide.verified}
                />
              )}
              {stats.average_rating > 0 && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(stats.average_rating) ? 'text-yellow-400' : 'text-gray-400'}>
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Location and Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {guide.location && (
                <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                  <MapPin className="w-3 h-3 mr-1" />
                  {guide.location}
                </Badge>
              )}
              <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                {stats.tours_completed}+ TOURS
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                ACTIVE SINCE {activeSinceYear}
              </Badge>
            </div>

            {/* Bio */}
            {guide.bio && (
              <p className="text-white/90 text-lg max-w-3xl mb-6 line-clamp-3">
                {guide.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-burgundy hover:bg-burgundy/90 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Guide
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-charcoal">
                <Calendar className="w-4 h-4 mr-2" />
                Book a Tour
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-charcoal">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-burgundy">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
