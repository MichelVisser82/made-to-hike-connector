import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, Info, Shield, Clock } from 'lucide-react';
import { CancellationApproach, CancellationPolicyType, CANCELLATION_POLICIES } from '@/types/policySettings';

interface CancellationPolicySettingsProps {
  approach: CancellationApproach;
  policyType: CancellationPolicyType;
  onChange: (approach: CancellationApproach, policyType: CancellationPolicyType) => void;
}

export function CancellationPolicySettings({ 
  approach, 
  policyType, 
  onChange 
}: CancellationPolicySettingsProps) {
  const [selectedApproach, setSelectedApproach] = useState<CancellationApproach>(approach);
  const [selectedPolicy, setSelectedPolicy] = useState<CancellationPolicyType>(policyType);

  const handleApproachChange = (newApproach: CancellationApproach) => {
    setSelectedApproach(newApproach);
    onChange(newApproach, selectedPolicy);
  };

  const handlePolicyChange = (newPolicy: CancellationPolicyType) => {
    setSelectedPolicy(newPolicy);
    onChange(selectedApproach, newPolicy);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
          <XCircle className="w-5 h-5 text-burgundy" />
          Cancellation Policy
        </CardTitle>
        <CardDescription>
          Set your default cancellation policy for all tours. You can override this for individual tours later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Approach Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Cancellation Approach</Label>
          <RadioGroup value={selectedApproach} onValueChange={(v) => handleApproachChange(v as CancellationApproach)}>
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="single" id="single" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="single" className="font-medium cursor-pointer">
                  Single Policy
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose one policy that applies to all customers. Simpler to manage.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="customer_choice" id="customer_choice" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="customer_choice" className="font-medium cursor-pointer">
                  Customer Choice
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Let customers pick from 3 tiers at checkout: Ultra-Flexible (+10%), Standard (base price), Non-Refundable (-10%)
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Policy Type Selection (only for Single Policy) */}
        {selectedApproach === 'single' && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Policy Type</Label>
            <RadioGroup value={selectedPolicy} onValueChange={(v) => handlePolicyChange(v as CancellationPolicyType)}>
              {Object.entries(CANCELLATION_POLICIES).map(([key, policy]) => (
                <div 
                  key={key}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem value={key} id={key} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={key} className="font-medium cursor-pointer flex items-center gap-2">
                      {policy.name}
                      {key === 'flexible' && <Shield className="w-4 h-4 text-green-600" />}
                      {key === 'strict' && <Clock className="w-4 h-4 text-orange-600" />}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                    <div className="mt-2 text-xs space-y-1">
                      {policy.tiers.map((tier, idx) => (
                        <div key={idx} className="text-muted-foreground">
                          {tier.daysOrMore > 0 ? `${tier.daysOrMore}+ days:` : 'Less than 3 days:'} {tier.refundPercent}% refund
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Customer Choice Preview */}
        {selectedApproach === 'customer_choice' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Customer Choice Pricing:</strong> Customers will see 3 options at checkout:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>Ultra-Flexible (+10%):</strong> Full refund up to 3 days before</li>
                <li>• <strong>Standard (base price):</strong> Full refund up to 15 days before</li>
                <li>• <strong>Non-Refundable (-10%):</strong> No refunds, lowest price</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
