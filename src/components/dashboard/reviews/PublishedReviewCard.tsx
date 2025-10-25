import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle2, Flag } from 'lucide-react';
import { ReviewData } from '@/hooks/useReviewSystem';
import { format } from 'date-fns';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { CertificationBadge } from '@/components/ui/certification-badge';

interface PublishedReviewCardProps {
  review: ReviewData;
  onResponse?: () => void;
  showResponseButton?: boolean;
}

export default function PublishedReviewCard({ 
  review, 
  onResponse,
  showResponseButton 
}: PublishedReviewCardProps) {
  const [showFullComment, setShowFullComment] = useState(false);
  
  const otherPersonName = review.profiles?.name || 'Unknown';
  const initials = otherPersonName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  // For guide reviews, use guide's profile picture
  const avatarUrl = review.review_type === 'guide_to_hiker' 
    ? review.guide_profiles?.profile_image_url 
    : review.profiles?.avatar_url;
  
  const publishedDate = review.published_at 
    ? format(new Date(review.published_at), 'MMMM yyyy')
    : '';

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  const truncateComment = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return showFullComment ? text : text.substring(0, maxLength) + '...';
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{otherPersonName}</h4>
                {review.review_type === 'guide_to_hiker' && review.guide_profiles?.certifications && review.guide_profiles.certifications.length > 0 && (
                  <CertificationBadge 
                    certification={review.guide_profiles.certifications[0]}
                    size="mini"
                    displayMode="simple"
                    showTooltip={true}
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {review.tours?.title}
              </p>
              <div className="flex items-center gap-3">
                {renderStars(review.overall_rating)}
                <span className="text-sm text-muted-foreground">
                  Reviewed {publishedDate}
                </span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <Flag className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {review.review_type === 'hiker_to_guide' && review.category_ratings && (
          <div className="space-y-3 pt-2">
            {Object.entries(review.category_ratings).map(([category, rating]) => (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">
                    {category === 'expertise' && 'Expertise & Knowledge'}
                    {category === 'safety' && 'Safety & Professionalism'}
                    {category === 'communication' && 'Communication'}
                    {category === 'leadership' && 'Group Leadership'}
                    {category === 'value' && 'Value for Money'}
                  </span>
                  <span className="font-medium">{rating}/5</span>
                </div>
                <Progress value={(rating / 5) * 100} className="h-2" />
              </div>
            ))}
          </div>
        )}

        {review.review_type === 'guide_to_hiker' && review.quick_assessment && (
          <div className="flex flex-wrap gap-3 pt-2">
            {Object.entries(review.quick_assessment).map(([key, value]) => (
              <div
                key={key}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {key === 'fitness_accurate' && 'Fitness Accurate'}
                  {key === 'well_prepared' && 'Well Prepared'}
                  {key === 'great_companion' && 'Great Companion'}
                  {key === 'would_guide_again' && 'Would Guide Again'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <p className="text-sm text-foreground leading-relaxed">
            {truncateComment(review.comment)}
          </p>
          {review.comment.length > 200 && (
            <button
              onClick={() => setShowFullComment(!showFullComment)}
              className="text-sm text-primary hover:underline mt-2"
            >
              {showFullComment ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {review.highlight_tags && review.highlight_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {review.highlight_tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {showResponseButton && onResponse && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onResponse}>
              Respond to Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
