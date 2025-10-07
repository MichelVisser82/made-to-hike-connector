import { Link } from 'react-router-dom';
import { Star, ArrowRight, Flame, MapPin, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import type { Tour } from '@/types';

interface EnrichedTour extends Tour {
  guide?: {
    display_name: string;
    profile_image_url: string | null;
    slug: string;
  } | null;
}

interface GuideActiveToursProps {
  tours: EnrichedTour[];
  guideId: string;
}

export function GuideActiveTours({ tours, guideId }: GuideActiveToursProps) {
  // Always render section, just show message if no tours
  const hasTours = tours && tours.length > 0;

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
          Active Tours
        </h2>
        <Link 
          to={`/search?guide=${guideId}`} 
          className="text-burgundy hover:underline flex items-center gap-1 font-medium"
        >
          See all tours <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {!hasTours ? (
        <p className="text-charcoal/60 text-center py-8">No active tours available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tours.map((tour) => {
            // Defensive: use guide data if available, otherwise fall back to denormalized data
            const guideName = tour.guide?.display_name || tour.guide_display_name || 'Guide';
            const guideAvatar = tour.guide?.profile_image_url || tour.guide_avatar_url;
            const guideInitials = guideName.split(' ').map(n => n[0]).join('');
            
            return (
          <Link key={tour.id} to={`/tours/${tour.slug || tour.id}`}>
            <Card className="rounded-xl shadow-lg hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="relative h-64">
                <img
                  src={tour.hero_image || tour.images?.[0] || 'https://via.placeholder.com/400x300'}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Gradient overlay - lighter and more natural */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Difficulty badge - top left */}
                <Badge className="absolute top-3 left-3 bg-white text-charcoal capitalize shadow-md rounded-full px-4 py-1.5">
                  {tour.difficulty}
                </Badge>
                
                {/* HOT badge - top right */}
                {tour.rating >= 4.5 && (
                  <Badge className="absolute top-3 right-3 bg-burgundy text-white shadow-md rounded-full">
                    <Flame className="w-3 h-3 mr-1" />
                    HOT!
                  </Badge>
                )}
                
                {/* Text overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8 z-10">
                  <h3 className="font-bold text-2xl mb-3 line-clamp-2 text-white" style={{fontFamily: 'Playfair Display, serif'}}>
                    {tour.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 border-2 border-white/50">
                      <AvatarImage 
                        src={guideAvatar || undefined} 
                        alt={guideName} 
                      />
                      <AvatarFallback className="text-xs bg-burgundy text-white">
                        {guideInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white/90">
                      by {guideName}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Smooth transition fade between image and content */}
              <div className="h-8 bg-gradient-to-t from-white to-transparent -mt-8 relative z-10" />
              
              <CardContent className="p-5 space-y-3">
                {/* Metadata with icons - vertical stack */}
                <div className="flex flex-col gap-1.5 text-sm text-charcoal/70">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-burgundy/70" />
                    <span className="capitalize">{tour.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-burgundy/70" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-burgundy/70" />
                    <span>Up to {tour.group_size}</span>
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-base font-bold text-charcoal">{tour.rating}</span>
                  <span className="text-sm text-charcoal/60">
                    ({tour.reviews_count} reviews)
                  </span>
                </div>
                
                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-3xl font-bold text-burgundy" style={{fontFamily: 'Playfair Display, serif'}}>
                    {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                  </span>
                  <Button className="bg-burgundy hover:bg-burgundy/90 text-white px-6 h-10">
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
