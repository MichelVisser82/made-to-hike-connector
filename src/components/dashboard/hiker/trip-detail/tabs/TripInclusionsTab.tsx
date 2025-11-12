import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripInclusionsTabProps {
  tripDetails: TripDetails;
}

export function TripInclusionsTab({ tripDetails }: TripInclusionsTabProps) {
  const { tour } = tripDetails;
  const includes = tour.includes || [];
  const excludes = tour.excluded_items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">What's Included & Not Included</h2>
        <p className="text-muted-foreground">
          Know exactly what's covered in your tour package
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What's Included */}
        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">What's Included</h3>
            </div>

            {includes.length > 0 ? (
              <ul className="space-y-3">
                {includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Details about what's included will be shared by your guide.
              </p>
            )}
          </CardContent>
        </Card>

        {/* What's Not Included */}
        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">What's Not Included</h3>
            </div>

            {excludes.length > 0 ? (
              <ul className="space-y-3">
                {excludes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your guide will clarify what you'll need to bring or arrange separately.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Notes */}
      <Card className="bg-accent/30">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Important Notes</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <p>Please review the packing checklist to ensure you bring all necessary personal items.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <p>If you have questions about what's included, message your guide directly.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              <p>Some items may be available for rent or purchase through your guide.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
