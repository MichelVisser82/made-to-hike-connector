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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Respond to {reviewerName}'s Review</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You can only respond once. Make sure your response is thoughtful and professional.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a one-time response. Once submitted, you cannot edit or delete it.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="response">
          Your Response <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="response"
          value={responseText}
          onChange={(e) => handleResponseChange(e.target.value)}
          placeholder="Thank you for your feedback..."
          rows={5}
          className="resize-none"
        />
        <p className={`text-sm ${charCount < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {charCount}/300 characters (minimum 10)
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={postResponse.isPending || charCount < 10}
        >
          {postResponse.isPending ? 'Posting...' : 'Post Response'}
        </Button>
      </div>
    </div>
  );
}
