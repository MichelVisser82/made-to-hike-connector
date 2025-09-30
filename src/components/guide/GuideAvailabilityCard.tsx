import { Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { GuideProfile } from '@/types/guide';

interface GuideAvailabilityCardProps {
  guide: GuideProfile;
}

export function GuideAvailabilityCard({ guide }: GuideAvailabilityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-6">Availability</h2>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-3">Seasonal Availability</h3>
              
              {guide.seasonal_availability && (
                <p className="text-muted-foreground mb-4">{guide.seasonal_availability}</p>
              )}

              {(guide.upcoming_availability_start && guide.upcoming_availability_end) && (
                <div className="mb-6">
                  <div className="text-sm font-medium mb-1">Upcoming Availability:</div>
                  <div className="text-lg">
                    {formatDate(guide.upcoming_availability_start)} - {formatDate(guide.upcoming_availability_end)}
                  </div>
                </div>
              )}

              {guide.daily_rate && (
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-1">Daily Rate</div>
                  <div className="text-3xl font-bold text-primary">
                    {guide.daily_rate_currency === 'EUR' ? '€' : '£'}{guide.daily_rate}
                  </div>
                </div>
              )}

              <Button size="lg" className="w-full sm:w-auto">
                REQUEST BOOKING
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
