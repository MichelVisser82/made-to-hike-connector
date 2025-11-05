import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Gift, CreditCard, Info } from 'lucide-react';
import { useGuidePolicyDefaults } from '@/hooks/useGuidePolicyDefaults';
import { TourPolicyOverrides, CANCELLATION_POLICIES } from '@/types/policySettings';

interface TourPolicyDisplayProps {
  guideId: string;
  policyOverrides?: TourPolicyOverrides | null;
  tourPrice: number;
  currency?: 'EUR' | 'GBP';
}

export function TourPolicyDisplay({ guideId, policyOverrides, tourPrice, currency = 'EUR' }: TourPolicyDisplayProps) {
  const { defaults, isLoading } = useGuidePolicyDefaults(guideId);

  if (isLoading) {
    return null;
  }

  if (!defaults && !policyOverrides) {
    return null;
  }

  const currencySymbol = currency === 'GBP' ? '£' : '€';

  // Determine active cancellation policy
  const usingDefaultCancellation = policyOverrides?.using_default_cancellation ?? true;
  const cancellationPolicyType = usingDefaultCancellation
    ? defaults?.cancellation_policy_type || 'flexible'
    : policyOverrides?.custom_cancellation_policy_type || 'flexible';

  const cancellationPolicy = CANCELLATION_POLICIES[cancellationPolicyType];

  // Determine active discounts
  const discountsDisabled = policyOverrides?.discounts_disabled ?? false;
  const usingDefaultDiscounts = policyOverrides?.using_default_discounts ?? true;
  
  const earlyBirdSettings = usingDefaultDiscounts
    ? defaults?.early_bird_settings
    : policyOverrides?.custom_discount_settings?.early_bird;

  const groupSettings = usingDefaultDiscounts
    ? defaults?.group_discount_settings
    : policyOverrides?.custom_discount_settings?.group;

  const lastMinuteSettings = usingDefaultDiscounts
    ? defaults?.last_minute_settings
    : policyOverrides?.custom_discount_settings?.last_minute;

  // Determine active payment schedule
  const usingDefaultPayment = policyOverrides?.using_default_payment ?? true;
  const depositType = usingDefaultPayment
    ? defaults?.deposit_type || 'percentage'
    : policyOverrides?.custom_deposit_type || 'percentage';

  const depositAmount = usingDefaultPayment
    ? defaults?.deposit_amount || 30
    : policyOverrides?.custom_deposit_amount || 30;

  const finalPaymentDays = usingDefaultPayment
    ? defaults?.final_payment_days || 14
    : policyOverrides?.custom_final_payment_days || 14;

  return (
    <div className="space-y-4">
      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Cancellation Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold">
              {cancellationPolicy.name}
            </Badge>
            <p className="text-sm text-muted-foreground">{cancellationPolicy.description}</p>
          </div>
          <div className="space-y-2">
            {cancellationPolicy.tiers.map((tier, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {tier.daysOrMore === 0 
                    ? 'Less than ' + cancellationPolicy.tiers[idx - 1]?.daysOrMore + ' days'
                    : tier.daysOrMore + '+ days before'}
                </span>
                <span className={tier.refundPercent > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                  {tier.refundPercent}% refund
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discounts */}
      {!discountsDisabled && (earlyBirdSettings?.enabled || groupSettings?.enabled || lastMinuteSettings?.enabled) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="w-5 h-5 text-primary" />
              Available Discounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {earlyBirdSettings?.enabled && (
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Early Bird</Badge>
                <div className="flex-1 text-sm">
                  <p className="text-muted-foreground">Book early and save:</p>
                  <ul className="mt-1 space-y-1">
                    {earlyBirdSettings.tier1_days > 0 && (
                      <li>• {earlyBirdSettings.tier1_percent}% off when booking {earlyBirdSettings.tier1_days}+ days ahead</li>
                    )}
                    {earlyBirdSettings.tier2_days > 0 && (
                      <li>• {earlyBirdSettings.tier2_percent}% off when booking {earlyBirdSettings.tier2_days}+ days ahead</li>
                    )}
                    {earlyBirdSettings.tier3_days > 0 && (
                      <li>• {earlyBirdSettings.tier3_percent}% off when booking {earlyBirdSettings.tier3_days}+ days ahead</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {groupSettings?.enabled && (
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">Group Discount</Badge>
                <div className="flex-1 text-sm">
                  <p className="text-muted-foreground">Larger groups save more:</p>
                  <ul className="mt-1 space-y-1">
                    {groupSettings.tier1_min > 0 && (
                      <li>• {groupSettings.tier1_percent}% off for {groupSettings.tier1_min}-{groupSettings.tier1_max} people</li>
                    )}
                    {groupSettings.tier2_min > 0 && (
                      <li>• {groupSettings.tier2_percent}% off for {groupSettings.tier2_min}-{groupSettings.tier2_max} people</li>
                    )}
                    {groupSettings.tier3_min > 0 && (
                      <li>• {groupSettings.tier3_percent}% off for {groupSettings.tier3_min}+ people</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {lastMinuteSettings?.enabled && (
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">Last Minute</Badge>
                <div className="flex-1 text-sm">
                  <p className="text-muted-foreground">
                    {lastMinuteSettings.percent}% off when booking within {lastMinuteSettings.hours} hours of tour start
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Deposit required:</span>
            <span className="font-medium">
              {depositType === 'percentage' 
                ? `${depositAmount}% of total`
                : depositType === 'none'
                ? 'No deposit required'
                : `${currencySymbol}${depositAmount}`
              }
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Final payment due:</span>
            <span className="font-medium">{finalPaymentDays} days before tour</span>
          </div>
          <div className="flex items-start gap-2 mt-3 p-3 bg-muted rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Pay a deposit to secure your spot, then the remaining balance {finalPaymentDays} days before your tour starts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
