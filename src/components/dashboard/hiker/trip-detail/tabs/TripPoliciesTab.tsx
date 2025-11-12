import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Shield, FileText } from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripPoliciesTabProps {
  tripDetails: TripDetails;
}

export function TripPoliciesTab({ tripDetails }: TripPoliciesTabProps) {
  const { tour, booking } = tripDetails;
  const policyOverrides = tour.policy_overrides;

  // Determine cancellation policy
  const getCancellationPolicy = () => {
    if (policyOverrides?.using_default_cancellation === false && policyOverrides?.custom_cancellation_policy_type) {
      return policyOverrides.custom_cancellation_policy_type;
    }
    return 'flexible'; // default
  };

  const cancellationType = getCancellationPolicy();

  const cancellationPolicies = {
    flexible: {
      title: 'Flexible',
      color: 'bg-green-100 text-green-700',
      rules: [
        'Full refund if canceled 7+ days before the tour',
        '50% refund if canceled 3-6 days before',
        'No refund if canceled less than 3 days before'
      ]
    },
    moderate: {
      title: 'Moderate',
      color: 'bg-yellow-100 text-yellow-700',
      rules: [
        'Full refund if canceled 14+ days before the tour',
        '50% refund if canceled 7-13 days before',
        'No refund if canceled less than 7 days before'
      ]
    },
    strict: {
      title: 'Strict',
      color: 'bg-red-100 text-red-700',
      rules: [
        'Full refund if canceled 30+ days before the tour',
        '50% refund if canceled 14-29 days before',
        'No refund if canceled less than 14 days before'
      ]
    }
  };

  const policy = cancellationPolicies[cancellationType as keyof typeof cancellationPolicies] || cancellationPolicies.flexible;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Tour Policies</h2>
        <p className="text-muted-foreground">
          Important information about cancellations, weather, and safety
        </p>
      </div>

      {/* Cancellation Policy */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Cancellation Policy</h3>
                <Badge className={policy.color}>{policy.title}</Badge>
              </div>
              <ul className="space-y-2">
                {policy.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              To cancel your booking or request a refund, please contact your guide directly or reach out to support.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weather Policy */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Weather & Safety Policy</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Weather Cancellations:</strong> If weather conditions are unsafe, your guide may cancel or reschedule the tour. In such cases, you'll receive a full refund or the option to reschedule.
                </p>
                <p>
                  <strong className="text-foreground">Guide's Decision:</strong> Your guide has final authority on safety decisions. Their priority is ensuring a safe and enjoyable experience for all participants.
                </p>
                <p>
                  <strong className="text-foreground">Communication:</strong> You'll be notified as early as possible of any weather-related changes via email and platform messaging.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety & Liability */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Safety & Liability</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  All participants must follow the guide's instructions and safety protocols at all times.
                </p>
                <p>
                  You must disclose any medical conditions, injuries, or physical limitations that might affect your ability to participate safely.
                </p>
                <p>
                  Travel insurance with medical coverage is strongly recommended for all participants.
                </p>
                <p className="font-medium text-foreground">
                  By participating, you acknowledge the inherent risks of outdoor activities and agree to the terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Booking Reference</span>
                  <span className="font-medium">{booking.booking_reference}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Payment Type</span>
                  <span className="font-medium capitalize">{booking.payment_type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant={booking.payment_status === 'succeeded' ? 'default' : 'secondary'}>
                    {booking.payment_status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-lg">{booking.currency} {booking.total_price}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
