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
    <section className="py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Active Tours</h2>
        <Link 
          to={`/search?guide=${guideId}`} 
          className="text-primary hover:underline flex items-center gap-1"
        >
          See all tours <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <Link key={tour.id} to={`/tours/${tour.slug || tour.id}`}>
            <Card className="hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="relative h-48">
                <img
                  src={tour.hero_image || tour.images?.[0] || 'https://via.placeholder.com/400x300'}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {tour.rating >= 4.5 && (
                  <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                    <Flame className="w-3 h-3 mr-1" />
                    HOT!
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{tour.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{tour.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({tour.reviews_count} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{tour.duration}</span>
                  <span className="text-lg font-bold text-primary">
                    {tour.currency === 'EUR' ? '€' : '£'}{tour.price}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
