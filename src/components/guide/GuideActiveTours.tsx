import { Link } from 'react-router-dom';
import { Star, ArrowRight, Flame } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <Link key={tour.id} to={`/tours/${tour.slug || tour.id}`}>
            <Card className="border-burgundy/20 shadow-lg hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="relative h-48">
                <img
                  src={tour.hero_image || tour.images?.[0] || 'https://via.placeholder.com/400x300'}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream via-cream/60 to-transparent" />
                {tour.rating >= 4.5 && (
                  <Badge className="absolute top-3 right-3 bg-burgundy text-white">
                    <Flame className="w-3 h-3 mr-1" />
                    HOT!
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
                  {tour.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-sm font-medium text-charcoal">{tour.rating}</span>
                  </div>
                  <span className="text-sm text-charcoal/60">
                    ({tour.reviews_count} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-charcoal/60">{tour.duration}</span>
                  <span className="text-lg font-bold text-burgundy">
                    {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                  </span>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  View Details
                </button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
