import { Card } from '@/components/ui/card';
import { CheckCircle, X } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripInclusionsTabProps {
  tripDetails: TripDetails;
}

export function TripInclusionsTab({ tripDetails }: TripInclusionsTabProps) {
  const { tour } = tripDetails;
  const includes = tour.includes || [];
  const excludes = tour.excluded_items || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* What's Included */}
      <Card className="p-6 bg-white border-burgundy/10 shadow-md">
        <h2 className="text-2xl mb-6 text-charcoal flex items-center gap-2 font-playfair">
          <CheckCircle className="w-6 h-6 text-sage" />
          What's Included
        </h2>
        <div className="space-y-3">
          {includes.length > 0 ? (
            includes.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-sage/5 border border-sage/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-charcoal text-sm">{item}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-charcoal/70">
              Details about what's included will be shared by your guide.
            </p>
          )}
        </div>
      </Card>

      {/* What's Not Included */}
      <Card className="p-6 bg-white border-burgundy/10 shadow-md">
        <h2 className="text-2xl mb-6 text-charcoal flex items-center gap-2 font-playfair">
          <X className="w-6 h-6 text-charcoal/40" />
          What's Not Included
        </h2>
        <div className="space-y-3">
          {excludes.length > 0 ? (
            excludes.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border border-burgundy/10 rounded-lg">
                <X className="w-5 h-5 text-charcoal/40 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-charcoal text-sm">{item}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-charcoal/70">
              Your guide will clarify what you'll need to bring or arrange separately.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
