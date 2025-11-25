import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePostReviewResponse } from '@/hooks/useReviewSystem';
import { toast } from 'sonner';

interface ReviewResponseFormProps {
  reviewId: string;
  responderType: 'guide' | 'hiker';
  reviewerName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewResponseForm({
  reviewId,
  responderType,
  reviewerName,
  onSuccess,
  onCancel,
}: ReviewResponseFormProps) {
  const postResponse = usePostReviewResponse();
  const [responseText, setResponseText] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleResponseChange = (value: string) => {
    if (value.length <= 300) {
      setResponseText(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = async () => {
    if (charCount < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    try {
      await postResponse.mutateAsync({
        reviewId,
        responderType,
        responseText,
      });

      toast.success('Response posted successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to post response');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-2xl font-semibold text-burgundy mb-2">
          Respond to {reviewerName}'s Review
        </h3>
        <p className="text-sm text-muted-foreground">
          You can only respond once. Make sure your response is thoughtful and professional.
        </p>
      </div>

      <Alert className="border-burgundy/20 bg-cream">
        <AlertCircle className="h-4 w-4 text-burgundy" />
        <AlertDescription className="text-charcoal">
          This is a one-time response. Once submitted, you cannot edit or delete it.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="response" className="text-base font-medium text-charcoal">
          Your Response <span className="text-burgundy">*</span>
        </Label>
        <Textarea
          id="response"
          value={responseText}
          onChange={(e) => handleResponseChange(e.target.value)}
          placeholder="Thank you for your feedback..."
          rows={5}
          className="resize-none border-border focus:border-burgundy focus:ring-burgundy"
        />
        <p className={`text-sm ${charCount < 10 ? 'text-burgundy font-medium' : 'text-muted-foreground'}`}>
          {charCount}/300 characters (minimum 10)
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="border-border hover:bg-cream">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={postResponse.isPending || charCount < 10}
          className="bg-burgundy hover:bg-burgundy-dark text-white"
        >
          {postResponse.isPending ? 'Posting...' : 'Post Response'}
        </Button>
      </div>
    </div>
  );
}
