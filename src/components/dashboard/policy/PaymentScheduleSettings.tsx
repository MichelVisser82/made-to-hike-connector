import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { CreditCard } from 'lucide-react';
import { DepositType } from '@/types/policySettings';

interface PaymentScheduleSettingsProps {
  depositType: DepositType;
  depositAmount: number;
  finalPaymentDays: number;
  onDepositTypeChange: (type: DepositType) => void;
  onDepositAmountChange: (amount: number) => void;
  onFinalPaymentDaysChange: (days: number) => void;
}

export function PaymentScheduleSettings({
  depositType,
  depositAmount,
  finalPaymentDays,
  onDepositTypeChange,
  onDepositAmountChange,
  onFinalPaymentDaysChange,
}: PaymentScheduleSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-burgundy" />
          Payment Schedule
        </CardTitle>
        <CardDescription>
          Set default deposit requirements and when final payment is due.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deposit Amount */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Deposit Amount</Label>
          <RadioGroup value={depositType} onValueChange={(v) => onDepositTypeChange(v as DepositType)}>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="percentage" id="percentage" />
              <div className="flex-1">
                <Label htmlFor="percentage" className="font-medium cursor-pointer">
                  Percentage of Tour Price
                </Label>
                {depositType === 'percentage' && (
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      min="10"
                      max="50"
                      value={depositAmount}
                      onChange={(e) => onDepositAmountChange(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">% (10-50%)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="none" id="none" />
              <div className="flex-1">
                <Label htmlFor="none" className="font-medium cursor-pointer">
                  No deposit - Immediate full payment
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Final Payment Due */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Final Payment Due</Label>
          <RadioGroup value={finalPaymentDays.toString()} onValueChange={(v) => onFinalPaymentDaysChange(Number(v))}>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="14" id="14days" />
              <Label htmlFor="14days" className="font-medium cursor-pointer">
                14 days before tour
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="21" id="21days" />
              <Label htmlFor="21days" className="font-medium cursor-pointer">
                21 days before tour
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="30" id="30days" />
              <Label htmlFor="30days" className="font-medium cursor-pointer">
                30 days before tour
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Timeline Visualization */}
        <div className="p-4 border rounded-lg bg-accent/10">
          <div className="text-sm font-medium mb-3">Payment Timeline</div>
          <div className="space-y-2 text-sm">
            {depositType === 'none' ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Booking Date:</span>
                <span className="font-medium">Full payment charged immediately</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Booking Date:</span>
                  <span className="font-medium">
                    {depositType === 'percentage' ? `${depositAmount}%` : `€${depositAmount}`} deposit charged
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{finalPaymentDays} days before tour:</span>
                  <span className="font-medium">Remaining balance auto-charged</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
