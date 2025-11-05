import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Settings, CheckCircle2 } from 'lucide-react';
import { CancellationPolicySettings } from '@/components/dashboard/policy/CancellationPolicySettings';
import { DiscountSettings } from '@/components/dashboard/policy/DiscountSettings';
import { PaymentScheduleSettings } from '@/components/dashboard/policy/PaymentScheduleSettings';
import { PricingPreview } from '@/components/dashboard/policy/PricingPreview';
import { usePricingCalculation } from '@/hooks/usePricingCalculation';
import { useGuidePolicyDefaults } from '@/hooks/useGuidePolicyDefaults';
import { useAuth } from '@/contexts/AuthContext';
import {
  CancellationApproach,
  CancellationPolicyType,
  EarlyBirdSettings,
  GroupDiscountSettings,
  LastMinuteSettings,
  DepositType,
  TourPolicyOverrides as TourPolicyOverridesType,
} from '@/types/policySettings';

interface TourPolicyOverridesProps {
  tourPrice: number;
  overrides: TourPolicyOverridesType;
  onChange: (overrides: TourPolicyOverridesType) => void;
}

export function TourPolicyOverrides({ tourPrice, overrides, onChange }: TourPolicyOverridesProps) {
  const { user } = useAuth();
  const { defaults } = useGuidePolicyDefaults(user?.id || null);

  const [cancellationOpen, setCancellationOpen] = useState(false);
  const [discountsOpen, setDiscountsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Use defaults or custom values
  const cancellationApproach = overrides.using_default_cancellation
    ? defaults?.cancellation_approach || 'single'
    : overrides.custom_cancellation_approach || 'single';
  
  const cancellationPolicy = overrides.using_default_cancellation
    ? defaults?.cancellation_policy_type || 'flexible'
    : overrides.custom_cancellation_policy_type || 'flexible';

  const earlyBird = overrides.using_default_discounts
    ? defaults?.early_bird_settings
    : overrides.custom_discount_settings?.early_bird;

  const group = overrides.using_default_discounts
    ? defaults?.group_discount_settings
    : overrides.custom_discount_settings?.group;

  const lastMinute = overrides.using_default_discounts
    ? defaults?.last_minute_settings
    : overrides.custom_discount_settings?.last_minute;

  const depositType = overrides.using_default_payment
    ? defaults?.deposit_type || 'percentage'
    : overrides.custom_deposit_type || 'percentage';

  const depositAmount = overrides.using_default_payment
    ? defaults?.deposit_amount || 30
    : overrides.custom_deposit_amount || 30;

  const finalPaymentDays = overrides.using_default_payment
    ? defaults?.final_payment_days || 14
    : overrides.custom_final_payment_days || 14;

  // Calculate preview pricing
  const previewPricing = usePricingCalculation({
    basePrice: tourPrice || 250,
    participants: 4,
    daysUntilTour: 45,
    earlyBirdSettings: earlyBird,
    groupSettings: group,
    lastMinuteSettings: lastMinute,
    discountsDisabled: overrides.discounts_disabled,
    depositType,
    depositAmount,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Cancellation Policy Section */}
          <Collapsible open={cancellationOpen} onOpenChange={setCancellationOpen}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-playfair text-charcoal flex items-center gap-2">
                    Cancellation Policy
                    {overrides.using_default_cancellation ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Using defaults
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <Settings className="w-3 h-3 mr-1" />
                        Custom
                      </Badge>
                    )}
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className={`w-4 h-4 transition-transform ${cancellationOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label htmlFor="use-default-cancellation">Use my default cancellation policy</Label>
                    <Switch
                      id="use-default-cancellation"
                      checked={overrides.using_default_cancellation}
                      onCheckedChange={(checked) =>
                        onChange({ ...overrides, using_default_cancellation: checked })
                      }
                    />
                  </div>
                  {!overrides.using_default_cancellation && (
                    <CancellationPolicySettings
                      approach={cancellationApproach as CancellationApproach}
                      policyType={cancellationPolicy as CancellationPolicyType}
                      onChange={(approach, policy) =>
                        onChange({
                          ...overrides,
                          custom_cancellation_approach: approach,
                          custom_cancellation_policy_type: policy,
                        })
                      }
                    />
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Discounts Section */}
          <Collapsible open={discountsOpen} onOpenChange={setDiscountsOpen}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-playfair text-charcoal flex items-center gap-2">
                    Discounts
                    {overrides.discounts_disabled ? (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Disabled
                      </Badge>
                    ) : overrides.using_default_discounts ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Using defaults
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <Settings className="w-3 h-3 mr-1" />
                        Custom
                      </Badge>
                    )}
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className={`w-4 h-4 transition-transform ${discountsOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label htmlFor="disable-discounts">Disable all discounts for this tour</Label>
                    <Switch
                      id="disable-discounts"
                      checked={overrides.discounts_disabled}
                      onCheckedChange={(disabled) =>
                        onChange({ ...overrides, discounts_disabled: disabled })
                      }
                    />
                  </div>
                  {!overrides.discounts_disabled && (
                    <>
                      <div className="flex items-center justify-between py-2 border-b">
                        <Label htmlFor="use-default-discounts">Apply my default discounts</Label>
                        <Switch
                          id="use-default-discounts"
                          checked={overrides.using_default_discounts}
                          onCheckedChange={(checked) =>
                            onChange({ ...overrides, using_default_discounts: checked })
                          }
                        />
                      </div>
                      {!overrides.using_default_discounts && earlyBird && group && lastMinute && (
                        <DiscountSettings
                          earlyBird={earlyBird}
                          group={group}
                          lastMinute={lastMinute}
                          onEarlyBirdChange={(settings) =>
                            onChange({
                              ...overrides,
                              custom_discount_settings: {
                                ...overrides.custom_discount_settings,
                                early_bird: settings,
                              },
                            })
                          }
                          onGroupChange={(settings) =>
                            onChange({
                              ...overrides,
                              custom_discount_settings: {
                                ...overrides.custom_discount_settings,
                                group: settings,
                              },
                            })
                          }
                          onLastMinuteChange={(settings) =>
                            onChange({
                              ...overrides,
                              custom_discount_settings: {
                                ...overrides.custom_discount_settings,
                                last_minute: settings,
                              },
                            })
                          }
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Payment Schedule Section */}
          <Collapsible open={paymentOpen} onOpenChange={setPaymentOpen}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-playfair text-charcoal flex items-center gap-2">
                    Payment Schedule
                    {overrides.using_default_payment ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Using defaults
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <Settings className="w-3 h-3 mr-1" />
                        Custom
                      </Badge>
                    )}
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className={`w-4 h-4 transition-transform ${paymentOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label htmlFor="use-default-payment">Use my default payment schedule</Label>
                    <Switch
                      id="use-default-payment"
                      checked={overrides.using_default_payment}
                      onCheckedChange={(checked) =>
                        onChange({ ...overrides, using_default_payment: checked })
                      }
                    />
                  </div>
                  {!overrides.using_default_payment && (
                    <PaymentScheduleSettings
                      depositType={depositType}
                      depositAmount={depositAmount}
                      finalPaymentDays={finalPaymentDays}
                      onDepositTypeChange={(type) =>
                        onChange({ ...overrides, custom_deposit_type: type })
                      }
                      onDepositAmountChange={(amount) =>
                        onChange({ ...overrides, custom_deposit_amount: amount })
                      }
                      onFinalPaymentDaysChange={(days) =>
                        onChange({ ...overrides, custom_final_payment_days: days })
                      }
                    />
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <PricingPreview breakdown={previewPricing} />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Live preview based on your settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
