import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewData, useSubmitReview } from '@/hooks/useReviewSystem';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

interface HikerReviewFormProps {
  review: ReviewData;
  onSuccess: () => void;
  onCancel: () => void;
}

const HIGHLIGHT_TAGS = [
  'Great storyteller',
  'Very knowledgeable',
  'Excellent pace',
  'Safety-focused',
  'Flexible',
  'Good value',
];

export default function HikerReviewForm({ review, onSuccess, onCancel }: HikerReviewFormProps) {
  const submitReview = useSubmitReview();
  
  const [categoryRatings, setCategoryRatings] = useState({
    expertise: 5,
    safety: 5,
    communication: 5,
    leadership: 5,
    value: 5,
  });

  const [comment, setComment] = useState('');
  const [highlightTags, setHighlightTags] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(0);

  const handleCommentChange = (value: string) => {
    if (value.length <= 1000) {
      setComment(value);
      setCharCount(value.length);
    }
  };

  const handleCategoryChange = (category: string, value: number[]) => {
    setCategoryRatings(prev => ({ ...prev, [category]: value[0] }));
  };

  const toggleHighlight = (tag: string) => {
    setHighlightTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (charCount < 50) {
      toast.error('Please write at least 50 characters');
      return;
    }

    const overallRating = Math.round(
      (categoryRatings.expertise + categoryRatings.safety + 
       categoryRatings.communication + categoryRatings.leadership + 
       categoryRatings.value) / 5
    );

    try {
      await submitReview.mutateAsync({
        reviewId: review.id,
        overallRating,
        comment,
        categoryRatings,
        highlightTags,
      });

      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to submit review');
      console.error(error);
    }
  };

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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Review Your Guide</h2>
        <p className="text-muted-foreground">Share your experience on {review.tours?.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Your Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(categoryRatings).map(([category, rating]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="capitalize">
                  {category === 'expertise' && 'Expertise & Knowledge'}
                  {category === 'safety' && 'Safety & Professionalism'}
                  {category === 'communication' && 'Communication'}
                  {category === 'leadership' && 'Group Leadership'}
                  {category === 'value' && 'Value for Money'}
                </Label>
                {renderStars(rating)}
              </div>
              <Slider
                value={[rating]}
                onValueChange={(value) => handleCategoryChange(category, value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="comment">
          Written Review <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          placeholder="Share your experience with this guide. What made this adventure memorable?"
          rows={6}
          className="resize-none"
        />
        <p className={`text-sm ${charCount < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {charCount}/1000 characters (minimum 50)
        </p>
      </div>

      <div className="space-y-3">
        <Label>Highlight Tags (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHT_TAGS.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={tag}
                checked={highlightTags.includes(tag)}
                onCheckedChange={() => toggleHighlight(tag)}
              />
              <label
                htmlFor={tag}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {tag}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={submitReview.isPending || charCount < 50}
        >
          {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
}
