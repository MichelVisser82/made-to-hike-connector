import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SmartImage } from '../SmartImage';
import { GuideInfoDisplay } from '../guide/GuideInfoDisplay';
import { useEnhancedGuideInfo } from '@/hooks/useEnhancedGuideInfo';
import { MapPin, Clock, Users, Star } from 'lucide-react';
import type { Tour } from '@/types';

interface TourCardProps {
  tour: Tour;
  onTourClick: (tour: Tour) => void;
  onBookTour: (tour: Tour) => void;
}

/**
 * Reusable tour card component with consistent guide data display
 * Uses useEnhancedGuideInfo for fresh, cached guide profile data
 */
export function TourCard({ tour, onTourClick, onBookTour }: TourCardProps) {
  const { guideInfo, isLoadingProfessional } = useEnhancedGuideInfo(tour);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
      onClick={() => onTourClick(tour)}
    >
      {/* Hero Image Section */}
      <div className="relative h-96 flex-shrink-0">
        {tour.hero_image ? (
          <img
            src={tour.hero_image}
            alt={`${tour.title} - ${tour.region} hiking tour`}
            className="w-full h-full object-cover"
          />
        ) : (
          <SmartImage
            category="tour"
            usageContext={tour.region}
            tags={[tour.region, tour.difficulty, 'landscape', 'hiking']}
            className="w-full h-full object-cover"
            fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop"
            alt={`${tour.title} - ${tour.region} hiking tour`}
          />
        )}
        
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Difficulty Badge */}
        <Badge 
          className="absolute top-4 right-4"
          variant={
            tour.difficulty === 'easy' ? 'default' :
            tour.difficulty === 'moderate' ? 'secondary' :
            'destructive'
          }
        >
          {tour.difficulty}
        </Badge>
        
        {/* Overlay Text Content */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-xl font-semibold mb-2 drop-shadow-lg">
            {tour.title}
          </h3>
          <GuideInfoDisplay
            guideInfo={guideInfo}
            isLoadingProfessional={isLoadingProfessional}
            showBadge={false}
            size="sm"
            variant="overlay"
          />
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{tour.region}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{tour.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{tour.group_size}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="font-semibold text-foreground">{tour.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold">{tour.currency === 'EUR' ? '€' : '£'}{tour.price}</span>
            <span className="text-xs text-muted-foreground ml-1">/ person</span>
          </div>
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBookTour(tour);
            }}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
