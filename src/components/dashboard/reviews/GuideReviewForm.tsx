import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewData, useSubmitReview } from '@/hooks/useReviewSystem';
import { toast } from 'sonner';
import { Star, CheckCircle2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface GuideReviewFormProps {
  review: ReviewData;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GuideReviewForm({ review, onSuccess, onCancel }: GuideReviewFormProps) {
  const submitReview = useSubmitReview();
  
  const [overallRating, setOverallRating] = useState(5);
  const [comment, setComment] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [quickAssessment, setQuickAssessment] = useState({
    fitness_accurate: true,
    well_prepared: true,
    great_companion: true,
    would_guide_again: true,
  });
  const [privateSafetyNotes, setPrivateSafetyNotes] = useState('');
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const handleCommentChange = (value: string) => {
    if (value.length <= 500) {
      setComment(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = async () => {
    if (charCount < 30) {
      toast.error('Please write at least 30 characters');
      return;
    }

    try {
      await submitReview.mutateAsync({
        reviewId: review.id,
        overallRating,
        comment,
        quickAssessment,
        privateSafetyNotes: privateSafetyNotes || undefined,
      });

      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to submit review');
      console.error(error);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setOverallRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${star <= overallRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Review Your Hiker</h2>
        <p className="text-muted-foreground">Share your experience with {review.profiles?.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            {renderStars()}
            <p className="text-sm text-muted-foreground">
              {overallRating === 5 && 'Excellent experience'}
              {overallRating === 4 && 'Very good experience'}
              {overallRating === 3 && 'Good experience'}
              {overallRating === 2 && 'Fair experience'}
              {overallRating === 1 && 'Needs improvement'}
            </p>
          </div>
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
          placeholder="How was your experience hiking with this person? Share what made them a great adventure companion."
          rows={5}
          className="resize-none"
        />
        <p className={`text-sm ${charCount < 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {charCount}/500 characters (minimum 30)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(quickAssessment).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${value ? 'text-primary' : 'text-muted-foreground'}`} />
                <Label className="font-normal cursor-pointer">
                  {key === 'fitness_accurate' && 'Fitness Level Accurate'}
                  {key === 'well_prepared' && 'Well Prepared'}
                  {key === 'great_companion' && 'Great Companion'}
                  {key === 'would_guide_again' && 'Would Guide Again'}
                </Label>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => 
                  setQuickAssessment(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="text-left">
                <CardTitle>Private Safety Notes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Visible only to MadeToHike administrators
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isNotesOpen ? 'rotate-180' : ''}`} />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Textarea
                value={privateSafetyNotes}
                onChange={(e) => setPrivateSafetyNotes(e.target.value)}
                placeholder="Any safety concerns or important observations for platform administrators..."
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {privateSafetyNotes.length}/500 characters
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={submitReview.isPending || charCount < 30}
        >
          {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
}
