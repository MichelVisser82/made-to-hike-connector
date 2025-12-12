import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SmartImage } from '../SmartImage';
import { GuideInfoDisplay } from '../guide/GuideInfoDisplay';
import { CertificationBadge } from '../ui/certification-badge';
import { RegionBadge } from '../common/RegionBadge';
import { ProfileWithBadge } from '../common/ProfileWithBadge';
import { useEnhancedGuideInfo } from '@/hooks/useEnhancedGuideInfo';
import { useGuideProfile } from '@/hooks/useGuideProfile';
import { useSavedTours } from '@/hooks/useSavedTours';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Users, Star, Heart, MapPin } from 'lucide-react';
import type { Tour } from '@/types';

interface TourCardProps {
  tour: Tour;
  onTourClick: (tour: Tour) => void;
  onBookTour: (tour: Tour) => void;
}

import { useState, useEffect } from 'react';

/**
 * Reusable tour card component with consistent guide data display
 * Uses useEnhancedGuideInfo for fresh, cached guide profile data
 */
export function TourCard({ tour, onTourClick, onBookTour }: TourCardProps) {
  const [userId, setUserId] = useState<string | undefined>();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);
  
  const { guideInfo, isLoadingProfessional } = useEnhancedGuideInfo(tour);
  const { data: guideProfile } = useGuideProfile(tour.guide_id);
  const { isTourSaved, toggleSaveTour } = useSavedTours(userId);
  const isSaved = isTourSaved(tour.id);
  
  // Pass certifications to GuideInfoDisplay for primary cert badge
  const certifications = guideProfile?.certifications;
  
  // Get Priority 1 & 2 certifications for display (show for verified guides)
  const priorityCerts = guideProfile?.certifications
    ?.filter(c => 
      c.verificationPriority && 
      c.verificationPriority <= 2
    )
    .slice(0, 2) || [];
  
  // Check if guide is verified
  const isGuideVerified = guideProfile?.verified || false;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveTour(tour.id);
  };

  return (
    <article 
      className="group relative bg-card rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border cursor-pointer"
      onClick={() => onTourClick(tour)}
    >
      {/* Hero Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* Save Button Overlay */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSaveClick}
          className={`absolute top-3 left-3 bg-white/90 backdrop-blur-sm z-10 shadow-sm
            ${isSaved ? 'text-burgundy opacity-100' : 'text-charcoal/70 hover:text-burgundy opacity-70 hover:opacity-100'}
            transition-all duration-200`}
          aria-label={isSaved ? 'Remove from saved tours' : 'Save tour'}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-burgundy' : ''}`} />
        </Button>
        
        {tour.hero_image ? (
          <img
            src={tour.hero_image}
            alt={`${tour.title} - ${tour.region} hiking tour`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <SmartImage
            category="tour"
            usageContext={tour.region}
            tags={[tour.region, tour.difficulty, 'landscape', 'hiking']}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop"
            alt={`${tour.title} - ${tour.region} hiking tour`}
          />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-cream-light" />
        
        {/* Difficulty Badge - Top Right */}
        <Badge 
          className="absolute top-3 right-3 border-0"
          variant={
            tour.difficulty === 'easy' ? 'default' :
            tour.difficulty === 'moderate' ? 'secondary' :
            'destructive'
          }
        >
          {tour.difficulty}
        </Badge>

        {/* Guide Avatar - Bottom Left */}
        <div className="absolute bottom-3 left-3">
          <ProfileWithBadge
            imageUrl={guideProfile?.profile_image_url || undefined}
            name={guideInfo.displayName}
            badgeType={guideProfile?.badge_type as 'founder' | 'pioneer-guide' | undefined}
            pioneerNumber={guideProfile?.pioneer_number || undefined}
            joinedDate={guideProfile?.created_at}
            size="sm"
            showVerifiedBadge={true}
            isVerified={isGuideVerified}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Tour Title and Guide */}
        <div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-1">
            {tour.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>by {guideInfo.displayName}</span>
            {priorityCerts.length > 0 && (
              <CertificationBadge
                certification={priorityCerts[0]}
                displayMode="simple"
                showTooltip={true}
              />
            )}
          </div>
        </div>

        {/* Reviews */}
        {tour.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium text-foreground">
              {tour.rating.toFixed(1)}
            </span>
            {tour.reviews_count > 0 && (
              <span className="text-xs text-muted-foreground">
                ({tour.reviews_count} reviews)
              </span>
            )}
          </div>
        )}

        {/* Stats - stacked for better readability */}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {(tour as any).region_country && (tour as any).region_region
                ? `${(tour as any).region_country} - ${(tour as any).region_region}`
                : tour.region}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>Max {tour.group_size}</span>
            </div>
          </div>
        </div>

        {/* Price and Book Button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="font-medium text-foreground text-lg">
            {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
            <span className="text-sm text-muted-foreground font-normal ml-1">/ person</span>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBookTour(tour);
            }}
            className="bg-burgundy hover:bg-burgundy/90 text-white"
            size="sm"
          >
            Book Now
          </Button>
        </div>
      </div>
    </article>
  );
}
