import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TourCard } from '../tour/TourCard';
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
  const navigate = useNavigate();
  const hasTours = tours && tours.length > 0;

  const handleTourClick = (tour: Tour) => {
    navigate(`/tours/${tour.slug || tour.id}`);
  };

  const handleBookTour = (tour: Tour) => {
    navigate(`/tours/${tour.slug || tour.id}`);
  };

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
          Active Tours
        </h2>
        <Link 
          to={`/tours?guide=${guideId}`} 
          className="text-burgundy hover:underline flex items-center gap-1 font-medium"
        >
          See all tours <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {!hasTours ? (
        <p className="text-charcoal/60 text-center py-8">No active tours available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onTourClick={handleTourClick}
              onBookTour={handleBookTour}
            />
          ))}
        </div>
      )}
    </section>
  );
}
