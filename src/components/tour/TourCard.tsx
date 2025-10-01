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
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onTourClick(tour)}
    >
      <div className="relative h-48 overflow-hidden">
        <SmartImage
          category="tour"
          usageContext={tour.region}
          tags={[tour.region, tour.difficulty, 'landscape', 'hiking']}
          className="w-full h-full object-cover"
          fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop"
          alt={`${tour.title} - ${tour.region} hiking tour`}
        />
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
      </div>

      <CardHeader>
        <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
        <GuideInfoDisplay
          guideInfo={guideInfo}
          isLoadingProfessional={isLoadingProfessional}
          showBadge={false}
          size="sm"
        />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{tour.region}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{tour.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Max {tour.group_size} people</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-semibold">{tour.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">
            ({tour.reviews_count} reviews)
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">{tour.currency === 'EUR' ? '€' : '£'}{tour.price}</span>
          <span className="text-sm text-muted-foreground ml-1">per person</span>
        </div>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onBookTour(tour);
          }}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}
