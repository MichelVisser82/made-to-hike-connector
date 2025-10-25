import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Star } from 'lucide-react';
import { ReviewData } from '@/hooks/useReviewSystem';
import { format } from 'date-fns';

interface PendingReviewCardProps {
  review: ReviewData;
  onWriteReview: (review: ReviewData) => void;
}

export default function PendingReviewCard({ review, onWriteReview }: PendingReviewCardProps) {
  const otherPersonName = review.profiles?.name || 'Unknown';
  
  // Get tour image - prefer images array over hero_image
  const tourImages = review.tours?.images;
  const tourImage = (tourImages && tourImages.length > 0) 
    ? tourImages[0] 
    : review.tours?.hero_image;
  
  const location = review.tours?.meeting_point_formatted || review.tours?.region || '';
  
  // Format booking date (when the tour actually happened)
  const bookingDate = review.bookings?.booking_date 
    ? format(new Date(review.bookings.booking_date), 'MMMM d, yyyy')
    : '';

  const reviewTypeLabel = review.review_type === 'hiker_to_guide' 
    ? 'Guide' 
    : 'Hiker';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Tour Image */}
          <div className="flex-shrink-0">
            <div className="w-48 h-32 rounded-lg overflow-hidden bg-muted">
              {tourImage ? (
                <img 
                  src={tourImage} 
                  alt={review.tours?.title || 'Tour'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
          </div>

          {/* Tour Details */}
          <div className="flex-1 space-y-3">
            <h3 className="text-xl font-semibold">{review.tours?.title}</h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{reviewTypeLabel}: {otherPersonName}</span>
              </div>
              
              {bookingDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{bookingDate}</span>
                </div>
              )}
              
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={() => onWriteReview(review)}
              className="gap-2"
              size="default"
            >
              <Star className="h-4 w-4" />
              Write Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
