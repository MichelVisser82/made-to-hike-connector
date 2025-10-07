import { Link } from 'react-router-dom';
import { Star, ArrowRight, Flame, MapPin, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import type { Tour } from '@/types';

interface GuideActiveToursProps {
  tours: Tour[];
  guideId: string;
}

export function GuideActiveTours({ tours, guideId }: GuideActiveToursProps) {
  if (!tours || tours.length === 0) return null;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tours.map((tour) => (
          <Link key={tour.id} to={`/tours/${tour.slug || tour.id}`}>
            <Card className="rounded-xl shadow-lg hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="relative h-64">
                <img
                  src={tour.hero_image || tour.images?.[0] || 'https://via.placeholder.com/400x300'}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
                
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
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6 z-10">
                  <h3 className="font-bold text-xl mb-2 line-clamp-2 text-white" style={{fontFamily: 'Playfair Display, serif'}}>
                    {tour.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 border-2 border-white/50">
                      <AvatarImage src={tour.guide_avatar_url} alt={tour.guide_display_name} />
                      <AvatarFallback className="text-xs bg-burgundy text-white">
                        {tour.guide_display_name?.split(' ').map(n => n[0]).join('') || 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white/90">
                      by {tour.guide_display_name || 'Guide'}
                    </span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-5">
                {/* Metadata with icons - vertical stack */}
                <div className="flex flex-col gap-2 text-sm text-charcoal/70">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-burgundy" />
                    <span className="capitalize">{tour.region}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-burgundy" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-burgundy" />
                    <span>Up to {tour.group_size}</span>
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <span className="text-lg font-bold text-charcoal">{tour.rating}</span>
                  <span className="text-sm text-charcoal/60">
                    ({tour.reviews_count} reviews)
                  </span>
                </div>
                
                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-4xl font-bold text-burgundy" style={{fontFamily: 'Playfair Display, serif'}}>
                    {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                  </span>
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8">
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
