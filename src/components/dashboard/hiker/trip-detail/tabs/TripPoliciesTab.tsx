import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, Cloud, Shield, Mountain, 
  Info, MessageSquare 
} from 'lucide-react';
import type { TripDetails } from '@/hooks/useTripDetails';

interface TripPoliciesTabProps {
  tripDetails: TripDetails;
}

export function TripPoliciesTab({ tripDetails }: TripPoliciesTabProps) {
  const { tour } = tripDetails;

  if (!tour) {
    return (
      <Card className="p-6 bg-white border-burgundy/10 shadow-md">
        <h2 className="text-2xl mb-6 text-charcoal font-playfair">
          Important Policies & Information
        </h2>
        <p className="text-sm text-charcoal/70">
          Tour policy information is not available right now. Please contact your guide if you have questions about cancellation policies, weather contingencies, or other important information.
        </p>
      </Card>
    );
  }

  const difficulty = tour.difficulty || 'moderate';

  return (
    <Card className="p-6 bg-white border-burgundy/10 shadow-md">
      <h2 className="text-2xl mb-6 text-charcoal font-playfair">
        Important Policies & Information
      </h2>

      <div className="space-y-6">
        {/* Cancellation Policy */}
        <div>
          <h3 className="text-lg mb-3 text-charcoal font-medium">Cancellation Policy</h3>
          <div className="space-y-2 text-sm text-charcoal/70">
            <p className="flex items-start gap-2">
              <span className="text-sage mt-0.5">•</span>
              <span><strong>30+ days before:</strong> Full refund minus 5% processing fee</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-sage mt-0.5">•</span>
              <span><strong>15-29 days before:</strong> 50% refund</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-gold mt-0.5">•</span>
              <span><strong>7-14 days before:</strong> 25% refund</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-burgundy mt-0.5">•</span>
              <span><strong>Less than 7 days:</strong> No refund</span>
            </p>
          </div>
        </div>

        <Separator />

        {/* Weather Contingency */}
        <div>
          <h3 className="text-lg mb-3 text-charcoal font-medium">Weather Contingency</h3>
          <p className="text-sm text-charcoal/70 mb-3">
            Mountain weather can be unpredictable. Your guide has the final say on any route changes or cancellations due to weather conditions.
          </p>
          <div className="bg-sage/10 border border-sage/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Cloud className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <div className="text-sm text-charcoal">
                <p className="font-medium mb-1">If the trip is cancelled due to unsafe conditions:</p>
                <p className="text-charcoal/70">You can either reschedule for another date (subject to availability) or receive a full refund. Your safety is our top priority.</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Fitness Requirements */}
        <div>
          <h3 className="text-lg mb-3 text-charcoal font-medium">Fitness Requirements</h3>
          <p className="text-sm text-charcoal/70 mb-3">
            This trek is rated as <strong className="capitalize">{difficulty}</strong> and requires appropriate physical preparation.
          </p>
          <div className="space-y-2 text-sm text-charcoal/70">
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>Good cardiovascular fitness for the difficulty level</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>Ability to hike with appropriate gear for the duration</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>No serious medical conditions that could affect participation</span>
            </p>
          </div>
        </div>

        <Separator />

        {/* Age Requirements */}
        <div>
          <h3 className="text-lg mb-3 text-charcoal font-medium">Age Requirements</h3>
          <p className="text-sm text-charcoal/70">
            Age requirements vary by tour difficulty. Minors must be accompanied by a legal guardian. Contact your guide for specific age restrictions.
          </p>
        </div>

        <Separator />

        {/* Insurance Requirements */}
        <div>
          <h3 className="text-lg mb-3 text-charcoal font-medium">Insurance Requirements</h3>
          <p className="text-sm text-charcoal/70 mb-3">
            Travel insurance with appropriate coverage is <strong>strongly recommended</strong> for this trek. Your policy should include:
          </p>
          <div className="space-y-2 text-sm text-charcoal/70">
            <p className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
              <span>Emergency medical coverage</span>
            </p>
            <p className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
              <span>Mountain rescue and evacuation (if applicable)</span>
            </p>
            <p className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-burgundy mt-0.5 flex-shrink-0" />
              <span>Trip cancellation and interruption coverage</span>
            </p>
          </div>
        </div>

        <Separator />

        {/* Group Size */}
        <div>
          <h3 className="text-lg mb-3 text-charcoal font-medium">Group Size</h3>
          <p className="text-sm text-charcoal/70">
            Maximum group size is {tour.group_size || 'determined by guide'} to ensure personalized attention and safety.
          </p>
        </div>

        <Separator />

        {/* Environmental Responsibility */}
        <div>
          <h3 className="text-lg mb-3 text-charcoal font-medium">Environmental Responsibility</h3>
          <p className="text-sm text-charcoal/70 mb-3">
            We practice Leave No Trace principles. All participants must:
          </p>
          <div className="space-y-2 text-sm text-charcoal/70">
            <p className="flex items-start gap-2">
              <Mountain className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>Carry out all trash (including organic waste)</span>
            </p>
            <p className="flex items-start gap-2">
              <Mountain className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>Stay on marked trails</span>
            </p>
            <p className="flex items-start gap-2">
              <Mountain className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
              <span>Respect wildlife and plant life</span>
            </p>
          </div>
        </div>

        {/* Questions Callout */}
        <div className="bg-burgundy/10 border border-burgundy/20 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-burgundy mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-charcoal mb-2">Questions About Policies?</h4>
              <p className="text-sm text-charcoal/70 mb-3">
                If you have any questions about our policies or need clarification, please don't hesitate to contact us.
              </p>
              <Button size="sm" className="bg-burgundy hover:bg-burgundy-dark text-white">
                <MessageSquare className="w-3.5 h-3.5 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
