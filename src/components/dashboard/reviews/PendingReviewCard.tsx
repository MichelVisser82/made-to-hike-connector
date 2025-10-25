import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, AlertCircle } from 'lucide-react';
import { ReviewData } from '@/hooks/useReviewSystem';
import { formatDistanceToNow } from 'date-fns';

interface PendingReviewCardProps {
  review: ReviewData;
  onWriteReview: (review: ReviewData) => void;
}

export default function PendingReviewCard({ review, onWriteReview }: PendingReviewCardProps) {
  const isExpiringSoon = review.expires_at && 
    new Date(review.expires_at).getTime() - Date.now() < 48 * 60 * 60 * 1000; // Less than 48 hours

  const timeRemaining = review.expires_at 
    ? formatDistanceToNow(new Date(review.expires_at), { addSuffix: true })
    : null;

  const otherPersonName = review.profiles?.name || 'Unknown';
  const initials = otherPersonName.split(' ').map(n => n[0]).join('').toUpperCase();

  const reviewTypeLabel = review.review_type === 'hiker_to_guide' 
    ? 'Review your guide' 
    : 'Review your hiker';

  return (
    <Card className={isExpiringSoon ? 'border-warning' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.profiles?.avatar_url} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{review.tours?.title}</h4>
                <p className="text-sm text-muted-foreground">{reviewTypeLabel}: {otherPersonName}</p>
              </div>
              {review.review_status === 'submitted' && (
                <Badge variant="secondary">Waiting for pair</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {timeRemaining && (
                  <span className={isExpiringSoon ? 'text-warning font-medium' : ''}>
                    Expires {timeRemaining}
                  </span>
                )}
              </div>
            </div>

            {isExpiringSoon && (
              <div className="flex items-center gap-2 text-warning text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Review expiring soon!</span>
              </div>
            )}

            {review.review_status === 'draft' && (
              <Button 
                onClick={() => onWriteReview(review)}
                size="sm"
                className="mt-2"
              >
                Write Review
              </Button>
            )}

            {review.review_status === 'submitted' && (
              <p className="text-sm text-muted-foreground mt-2">
                Your review will be published when {otherPersonName} completes theirs
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
