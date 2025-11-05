/**
 * Type definitions for cancellation policies, discounts, and payment settings
 */

export type CancellationApproach = 'single' | 'customer_choice';
export type CancellationPolicyType = 'flexible' | 'moderate' | 'strict' | 'non_refundable';
export type DepositType = 'percentage' | 'none';

export interface EarlyBirdSettings {
  enabled: boolean;
  tier1_days: number;
  tier1_percent: number;
  tier2_days: number;
  tier2_percent: number;
  tier3_days: number;
  tier3_percent: number;
}

export interface GroupDiscountSettings {
  enabled: boolean;
  tier1_min: number;
  tier1_max: number;
  tier1_percent: number;
  tier2_min: number;
  tier2_max: number;
  tier2_percent: number;
  tier3_min: number;
  tier3_percent: number;
}

export interface LastMinuteSettings {
  enabled: boolean;
  hours: number;
  percent: number;
}

export interface GuidePolicyDefaults {
  cancellation_approach: CancellationApproach;
  cancellation_policy_type: CancellationPolicyType;
  early_bird_settings: EarlyBirdSettings;
  group_discount_settings: GroupDiscountSettings;
  last_minute_settings: LastMinuteSettings;
  deposit_type: DepositType;
  deposit_amount: number;
  final_payment_days: number;
}

export interface TourPolicyOverrides {
  using_default_cancellation: boolean;
  custom_cancellation_approach?: CancellationApproach;
  custom_cancellation_policy_type?: CancellationPolicyType;
  using_default_discounts: boolean;
  custom_discount_settings?: {
    early_bird?: EarlyBirdSettings;
    group?: GroupDiscountSettings;
    last_minute?: LastMinuteSettings;
  };
  discounts_disabled: boolean;
  using_default_payment: boolean;
  custom_deposit_type?: DepositType;
  custom_deposit_amount?: number;
  custom_final_payment_days?: number;
}

export interface CancellationPolicy {
  name: string;
  description: string;
  tiers: {
    daysOrMore: number;
    refundPercent: number;
  }[];
}

export const CANCELLATION_POLICIES: Record<CancellationPolicyType, CancellationPolicy> = {
  flexible: {
    name: 'Flexible',
    description: 'Full refund up to 15 days before the tour',
    tiers: [
      { daysOrMore: 15, refundPercent: 100 },
      { daysOrMore: 8, refundPercent: 50 },
      { daysOrMore: 3, refundPercent: 25 },
      { daysOrMore: 0, refundPercent: 0 },
    ],
  },
  moderate: {
    name: 'Moderate',
    description: 'Full refund up to 30 days before the tour',
    tiers: [
      { daysOrMore: 30, refundPercent: 100 },
      { daysOrMore: 15, refundPercent: 50 },
      { daysOrMore: 8, refundPercent: 25 },
      { daysOrMore: 0, refundPercent: 0 },
    ],
  },
  strict: {
    name: 'Strict',
    description: 'Partial refund up to 60 days before the tour',
    tiers: [
      { daysOrMore: 60, refundPercent: 50 },
      { daysOrMore: 0, refundPercent: 0 },
    ],
  },
  non_refundable: {
    name: 'Non-Refundable',
    description: 'No refunds under any circumstances',
    tiers: [
      { daysOrMore: 0, refundPercent: 0 },
    ],
  },
};

export interface PricingBreakdown {
  basePrice: number;
  earlyBirdDiscount: number;
  groupDiscount: number;
  lastMinuteDiscount: number;
  totalDiscount: number;
  finalPrice: number;
  depositAmount: number;
  finalPaymentAmount: number;
}
