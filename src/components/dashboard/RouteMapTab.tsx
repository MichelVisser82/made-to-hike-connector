import { FullMapReveal } from '../booking/FullMapReveal';
import { Card, CardContent } from '@/components/ui/card';

interface RouteMapTabProps {
  tourId: string;
  bookingId: string;
}

export function RouteMapTab({ tourId, bookingId }: RouteMapTabProps) {
  return (
    <div className="space-y-6">
      <FullMapReveal tourId={tourId} bookingId={bookingId} />
    </div>
  );
}
