import { useState, useEffect } from 'react';
import { Star, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import type { GuideWithStats } from '@/hooks/useAllGuides';
import { getCertificationMetadata } from '@/constants/certificationMetadata';

interface GuideCardProps {
  guide: GuideWithStats;
}

export function GuideCard({ guide }: GuideCardProps) {
  const navigate = useNavigate();
  const { fetchImages, getImageUrl } = useWebsiteImages();
  const [guideHeroImage, setGuideHeroImage] = useState<string | null>(null);

  useEffect(() => {
    const loadGuideImage = async () => {
      // Try to get guide's portfolio or hero images
      const images = await fetchImages({ guide_id: guide.user_id, limit: 1 });
      if (images && images.length > 0) {
        setGuideHeroImage(getImageUrl(images[0]));
      } else if (guide.hero_background_url) {
        setGuideHeroImage(guide.hero_background_url);
      }
    };
    loadGuideImage();
  }, [guide.user_id, guide.hero_background_url, fetchImages, getImageUrl]);

  const handleViewProfile = () => {
    if (guide.slug) {
      navigate(`/${guide.slug}`);
    }
  };

  // Get top 3 certifications
  const topCertifications = guide.certifications?.slice(0, 3) || [];

  return (
    <article className="group relative bg-card rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border">
      {/* Hero Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={guideHeroImage || guide.hero_background_url || guide.profile_image_url || '/placeholder.svg'}
          alt={`${guide.display_name} - Mountain Guide`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-cream-light" />

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex gap-2">
          {guide.is_featured && (
            <Badge className="bg-amber-600 hover:bg-amber-600 text-white border-0">
              Featured
            </Badge>
          )}
          {guide.verified && (
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0">
              Verified
            </Badge>
          )}
        </div>

        {/* Rating - Top Right */}
        {guide.reviews_count > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium text-gray-900">
              {guide.average_rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({guide.reviews_count})
            </span>
          </div>
        )}

        {/* Guide Avatar - Bottom Left */}
        <div className="absolute bottom-3 left-3">
          <img
            src={guide.profile_image_url || '/placeholder.svg'}
            alt={guide.display_name}
            className="w-24 h-24 rounded-full border-2 border-white shadow-lg object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Name and Location */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {guide.display_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {guide.location || 'Location not specified'}
          </p>
        </div>

        {/* Bio */}
        {guide.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {guide.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {guide.experience_years && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{guide.experience_years} years</span>
            </div>
          )}
          {guide.min_group_size && guide.max_group_size && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{guide.min_group_size}-{guide.max_group_size}</span>
            </div>
          )}
          {guide.daily_rate && (
            <div className="font-medium text-foreground">
              €{guide.daily_rate}/day
            </div>
          )}
        </div>

        {/* Certifications */}
        {topCertifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topCertifications.map((cert, idx) => {
              const metadata = getCertificationMetadata(cert.title);
              return (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs"
                  style={metadata?.badgeColor ? { 
                    backgroundColor: `${metadata.badgeColor}15`,
                    color: metadata.badgeColor,
                    borderColor: metadata.badgeColor
                  } : {}}
                >
                  {cert.title}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Specialties */}
        {guide.specialties && guide.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {guide.specialties.slice(0, 3).map((specialty, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        {/* View Profile Button */}
        <Button
          onClick={handleViewProfile}
          className="w-full bg-[#881337] hover:bg-[#7f1d1d] text-white"
          size="lg"
        >
          View Profile
        </Button>
      </div>
    </article>
  );
}
