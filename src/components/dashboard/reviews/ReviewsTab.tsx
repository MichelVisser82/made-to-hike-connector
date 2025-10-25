import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { usePendingReviews, useReceivedReviews, ReviewData } from '@/hooks/useReviewSystem';
import PendingReviewCard from './PendingReviewCard';
import PublishedReviewCard from './PublishedReviewCard';
import HikerReviewForm from './HikerReviewForm';
import GuideReviewForm from './GuideReviewForm';
import ReviewResponseForm from './ReviewResponseForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';

interface ReviewsTabProps {
  isGuide: boolean;
}

export default function ReviewsTab({ isGuide }: ReviewsTabProps) {
  const pendingReviews = usePendingReviews();
  const receivedReviews = useReceivedReviews(isGuide);
  
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
  const [responseFormOpen, setResponseFormOpen] = useState(false);
  const [selectedReviewForResponse, setSelectedReviewForResponse] = useState<ReviewData | null>(null);

  const handleWriteReview = (review: ReviewData) => {
    setSelectedReview(review);
    setReviewFormOpen(true);
  };

  const handleReviewSuccess = () => {
    setReviewFormOpen(false);
    setSelectedReview(null);
    pendingReviews.refetch();
    receivedReviews.refetch();
  };

  const handleRespondToReview = (review: ReviewData) => {
    setSelectedReviewForResponse(review);
    setResponseFormOpen(true);
  };

  const handleResponseSuccess = () => {
    setResponseFormOpen(false);
    setSelectedReviewForResponse(null);
    receivedReviews.refetch();
  };

  const pendingCount = pendingReviews.data?.filter(r => r.review_status === 'draft').length || 0;
  const submittedCount = pendingReviews.data?.filter(r => r.review_status === 'submitted').length || 0;

  return (
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
          <TabsTrigger value="awaiting">
            Awaiting Publication {submittedCount > 0 && `(${submittedCount})`}
          </TabsTrigger>
          <TabsTrigger value="received">
            Reviews Received
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingReviews.isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading pending reviews...
              </CardContent>
            </Card>
          ) : pendingReviews.data?.filter(r => r.review_status === 'draft').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending reviews to write</p>
                <p className="text-sm mt-1">Reviews become available 24 hours after your tours complete</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {pendingReviews.data
                  ?.filter(r => r.review_status === 'draft')
                  .map((review) => (
                    <PendingReviewCard
                      key={review.id}
                      review={review}
                      onWriteReview={handleWriteReview}
                    />
                  ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="awaiting" className="space-y-4 mt-4">
          {pendingReviews.data?.filter(r => r.review_status === 'submitted').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>No reviews awaiting publication</p>
                <p className="text-sm mt-1">Reviews are published when both parties complete theirs</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {pendingReviews.data
                  ?.filter(r => r.review_status === 'submitted')
                  .map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{review.tours?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Your review is submitted and will be published when {review.profiles?.name} completes theirs.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4 mt-4">
          {receivedReviews.isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading reviews...
              </CardContent>
            </Card>
          ) : receivedReviews.data?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>No reviews received yet</p>
                <p className="text-sm mt-1">Reviews will appear here after your tours are completed</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {receivedReviews.data?.map((review) => (
                  <PublishedReviewCard
                    key={review.id}
                    review={review}
                    showResponseButton={true}
                    onResponse={() => handleRespondToReview(review)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Form Dialog */}
      <Dialog open={reviewFormOpen} onOpenChange={setReviewFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReview && (
            selectedReview.review_type === 'hiker_to_guide' ? (
              <HikerReviewForm
                review={selectedReview}
                onSuccess={handleReviewSuccess}
                onCancel={() => setReviewFormOpen(false)}
              />
            ) : (
              <GuideReviewForm
                review={selectedReview}
                onSuccess={handleReviewSuccess}
                onCancel={() => setReviewFormOpen(false)}
              />
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Response Form Dialog */}
      <Dialog open={responseFormOpen} onOpenChange={setResponseFormOpen}>
        <DialogContent className="max-w-xl">
          {selectedReviewForResponse && (
            <ReviewResponseForm
              reviewId={selectedReviewForResponse.id}
              responderType={isGuide ? 'guide' : 'hiker'}
              reviewerName={selectedReviewForResponse.profiles?.name || 'Unknown'}
              onSuccess={handleResponseSuccess}
              onCancel={() => setResponseFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
