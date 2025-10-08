import { Heart, Star, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MockTourCardProps {
  title: string;
  location: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  duration: string;
  price: number;
  rating: number;
  imageUrl: string;
}

export function MockTourCard({
  title,
  location,
  difficulty,
  duration,
  price,
  rating,
  imageUrl,
}: MockTourCardProps) {
  const difficultyColors = {
    Easy: 'bg-green-600',
    Moderate: 'bg-amber-600',
    Challenging: 'bg-red-600',
  };

  return (
    <Card className="overflow-hidden group cursor-pointer transition-shadow duration-300 hover:shadow-elegant">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
        
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white"
        >
          <Heart className="h-5 w-5 text-burgundy" />
        </Button>

        <Badge className={`absolute top-3 left-3 ${difficultyColors[difficulty]} text-white border-0`}>
          {difficulty}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-charcoal line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="font-medium text-charcoal">{rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-charcoal">€{price}</div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
