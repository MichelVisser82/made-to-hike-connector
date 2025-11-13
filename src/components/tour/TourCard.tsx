import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SmartImage } from '../SmartImage';
import { GuideInfoDisplay } from '../guide/GuideInfoDisplay';
import { CertificationBadge } from '../ui/certification-badge';
import { useEnhancedGuideInfo } from '@/hooks/useEnhancedGuideInfo';
import { useGuideProfile } from '@/hooks/useGuideProfile';
import { useSavedTours } from '@/hooks/useSavedTours';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, Users, Star, Heart } from 'lucide-react';
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
          className={`absolute top-3 left-3 bg-white/90 backdrop-blur-sm z-10
            ${isSaved ? 'text-burgundy' : 'text-charcoal/70 hover:text-burgundy'}
            opacity-0 group-hover:opacity-100 transition-opacity shadow-sm`}
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
        
        {/* Difficulty Badge - Top Left */}
        <Badge 
          className="absolute top-3 left-3 border-0"
          variant={
            tour.difficulty === 'easy' ? 'default' :
            tour.difficulty === 'moderate' ? 'secondary' :
            'destructive'
          }
        >
          {tour.difficulty}
        </Badge>

        {/* Rating - Top Right */}
        {tour.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium text-gray-900">
              {tour.rating.toFixed(1)}
            </span>
            {tour.reviews_count > 0 && (
              <span className="text-xs text-gray-500">
                ({tour.reviews_count})
              </span>
            )}
          </div>
        )}

        {/* Guide Avatar - Bottom Left */}
        <div className="absolute bottom-3 left-3">
          {guideProfile?.profile_image_url ? (
            <img
              src={guideProfile.profile_image_url}
              alt={guideInfo.displayName}
              className="w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-white shadow-lg bg-muted flex items-center justify-center">
              <span className="text-lg font-semibold text-muted-foreground">
                {guideInfo.displayName.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Tour Title and Guide */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {tour.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            by {guideInfo.displayName}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{tour.region}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{tour.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Max {tour.group_size}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="font-medium text-foreground text-lg">
            {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
            <span className="text-sm text-muted-foreground font-normal ml-1">/ person</span>
          </div>
        </div>

        {/* Book Now Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onBookTour(tour);
          }}
          className="w-full bg-[#881337] hover:bg-[#7f1d1d] text-white"
          size="lg"
        >
          Book Now
        </Button>
      </div>
    </article>
  );
}
