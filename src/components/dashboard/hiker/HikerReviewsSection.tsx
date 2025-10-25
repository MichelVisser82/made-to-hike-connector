import ReviewsTab from '@/components/dashboard/reviews/ReviewsTab';

interface HikerReviewsSectionProps {
  userId: string;
  onWriteReview?: (tourId: string) => void;
  openBookingId?: string;
}

export function HikerReviewsSection({ userId, onWriteReview, openBookingId }: HikerReviewsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif mb-2">Reviews & Badges</h1>
      </div>

      <ReviewsTab isGuide={false} openBookingId={openBookingId} />
    </div>
  );
}
