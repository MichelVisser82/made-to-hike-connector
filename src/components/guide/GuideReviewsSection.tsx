import { Star, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import type { GuideReview } from '@/hooks/useGuideReviews';
import { ReviewCategoryRatings } from './ReviewCategoryRatings';

interface GuideReviewsSectionProps {
  reviews: GuideReview[];
  averageRating: number;
  totalReviews: number;
  ratings?: {
    safety: number;
    knowledge: number;
    communication: number;
    value: number;
    overall: number;
  };
  recommendPercentage?: number;
  aboveBeyondPercentage?: number;
}

export function GuideReviewsSection({ 
  reviews, 
  averageRating, 
  totalReviews,
  ratings,
  recommendPercentage = 98,
  aboveBeyondPercentage = 95
}: GuideReviewsSectionProps) {
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
    <section className="space-y-6">
      {/* Header Card with Title, Rating, and Category Breakdown */}
      <Card className="border-burgundy/20 shadow-lg bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>
              Reviews & Testimonials
            </h2>
            {totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-charcoal">{averageRating.toFixed(1)}</span>
                <span className="text-charcoal/60">({totalReviews} reviews)</span>
              </div>
            )}
          </div>
          {ratings && totalReviews > 0 && (
            <ReviewCategoryRatings 
              ratings={ratings}
              recommendPercentage={recommendPercentage}
              aboveBeyondPercentage={aboveBeyondPercentage}
            />
          )}
        </CardContent>
      </Card>

      {/* Review Cards */}
      {reviews && reviews.length > 0 ? (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border-burgundy/20 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.hiker_avatar} alt={review.hiker_name} />
                      <AvatarFallback className="bg-burgundy/10 text-burgundy">
                        {review.hiker_name?.charAt(0) || 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-charcoal text-lg">{review.hiker_name || 'Anonymous'}</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified Booking
                            </Badge>
                          </div>
                          <div className="text-sm text-charcoal/70 mb-1">
                            Ben Nevis Summit Challenge
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                          <div className="text-sm text-charcoal/60">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>
                      <p className="text-charcoal/80 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalReviews > reviews.length && (
            <div className="mt-6 text-center">
              <Button variant="outline" className="border-burgundy/30 text-burgundy hover:bg-burgundy hover:text-white">
                Load More Reviews
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="border-burgundy/20 shadow-lg bg-white">
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-burgundy/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">No reviews yet</h3>
            <p className="text-charcoal/60">Be the first to share your experience with this guide!</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
