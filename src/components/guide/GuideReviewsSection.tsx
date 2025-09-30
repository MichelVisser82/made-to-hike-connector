import { Star } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { GuideReview } from '@/hooks/useGuideReviews';

interface GuideReviewsSectionProps {
  reviews: GuideReview[];
  averageRating: number;
  totalReviews: number;
}

export function GuideReviewsSection({ reviews, averageRating, totalReviews }: GuideReviewsSectionProps) {
  if (!reviews || reviews.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">Reviews & Testimonials</h2>

      {/* Overall Rating */}
      <div className="flex items-center gap-6 mb-8">
        <div>
          <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex gap-1 mt-2">
            {renderStars(Math.round(averageRating))}
          </div>
        </div>
        <div className="text-muted-foreground">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.hiker_avatar} alt={review.hiker_name} />
                  <AvatarFallback>
                    {review.hiker_name?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold">{review.hiker_name || 'Anonymous'}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-foreground">{review.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalReviews > reviews.length && (
        <div className="mt-6 text-center">
          <Button variant="outline">Load More Reviews</Button>
        </div>
      )}
    </section>
  );
}
