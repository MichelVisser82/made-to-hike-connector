import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGuidePolicyDefaults } from '@/hooks/useGuidePolicyDefaults';
import { CancellationPolicySettings } from './CancellationPolicySettings';
import { DiscountSettings } from './DiscountSettings';
import { PaymentScheduleSettings } from './PaymentScheduleSettings';
import { DiscountCodesManager } from './DiscountCodesManager';
import { PricingPreview } from './PricingPreview';
import { usePricingCalculation } from '@/hooks/usePricingCalculation';
import { Loader2 } from 'lucide-react';
import { 
  CancellationApproach, 
  CancellationPolicyType,
  EarlyBirdSettings,
  GroupDiscountSettings,
  LastMinuteSettings,
  DepositType
} from '@/types/policySettings';

export function CancellationDiscountsTab() {
  const { user } = useAuth();
  const { defaults, isLoading, updateDefaults, isUpdating } = useGuidePolicyDefaults(user?.id || null);

  const [cancellationApproach, setCancellationApproach] = useState<CancellationApproach>(
    defaults?.cancellation_approach || 'single'
  );
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicyType>(
    defaults?.cancellation_policy_type || 'flexible'
  );
  const [earlyBird, setEarlyBird] = useState<EarlyBirdSettings>(
    defaults?.early_bird_settings || {
      enabled: false,
      tier1_days: 60,
      tier1_percent: 10,
      tier2_days: 30,
      tier2_percent: 7,
      tier3_days: 14,
      tier3_percent: 5,
    }
  );
  const [group, setGroup] = useState<GroupDiscountSettings>(
    defaults?.group_discount_settings || {
      enabled: false,
      tier1_min: 2,
      tier1_max: 3,
      tier1_percent: 5,
      tier2_min: 4,
      tier2_max: 5,
      tier2_percent: 10,
      tier3_min: 6,
      tier3_percent: 15,
    }
  );
  const [lastMinute, setLastMinute] = useState<LastMinuteSettings>(
    defaults?.last_minute_settings || {
      enabled: false,
      hours: 72,
      percent: 10,
    }
  );
  const [depositType, setDepositType] = useState<DepositType>(
    defaults?.deposit_type || 'percentage'
  );
  const [depositAmount, setDepositAmount] = useState<number>(
    defaults?.deposit_amount || 30
  );
  const [finalPaymentDays, setFinalPaymentDays] = useState<number>(
    defaults?.final_payment_days || 14
  );

  // Update local state when defaults load
  useState(() => {
    if (defaults) {
      setCancellationApproach(defaults.cancellation_approach);
      setCancellationPolicy(defaults.cancellation_policy_type);
      setEarlyBird(defaults.early_bird_settings);
      setGroup(defaults.group_discount_settings);
      setLastMinute(defaults.last_minute_settings);
      setDepositType(defaults.deposit_type);
      setDepositAmount(defaults.deposit_amount);
      setFinalPaymentDays(defaults.final_payment_days);
    }
  });

  // Calculate preview pricing (example: €250 base, 4 people, 45 days until tour)
  const previewPricing = usePricingCalculation({
    basePrice: 250,
    participants: 4,
    daysUntilTour: 45,
    earlyBirdSettings: earlyBird,
    groupSettings: group,
    lastMinuteSettings: lastMinute,
    discountsDisabled: false,
    depositType,
    depositAmount,
  });

  const handleSave = () => {
    updateDefaults({
      cancellation_approach: cancellationApproach,
      cancellation_policy_type: cancellationPolicy,
      early_bird_settings: earlyBird,
      group_discount_settings: group,
      last_minute_settings: lastMinute,
      deposit_type: depositType,
      deposit_amount: depositAmount,
      final_payment_days: finalPaymentDays,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CancellationPolicySettings
            approach={cancellationApproach}
            policyType={cancellationPolicy}
            onChange={(approach, policy) => {
              setCancellationApproach(approach);
              setCancellationPolicy(policy);
            }}
          />

          <DiscountSettings
            earlyBird={earlyBird}
            group={group}
            lastMinute={lastMinute}
            onEarlyBirdChange={setEarlyBird}
            onGroupChange={setGroup}
            onLastMinuteChange={setLastMinute}
          />

          <PaymentScheduleSettings
            depositType={depositType}
            depositAmount={depositAmount}
            finalPaymentDays={finalPaymentDays}
            onDepositTypeChange={setDepositType}
            onDepositAmountChange={setDepositAmount}
            onFinalPaymentDaysChange={setFinalPaymentDays}
          />

          <DiscountCodesManager guideId={user?.id} isAdmin={false} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <PricingPreview breakdown={previewPricing} />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Example: €250 per person, booked 45 days ahead
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-background border-t pt-4 pb-2">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            'Save Default Settings'
          )}
        </Button>
      </div>
    </div>
  );
}
