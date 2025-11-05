import { useMemo } from 'react';
import { 
  EarlyBirdSettings, 
  GroupDiscountSettings, 
  LastMinuteSettings,
  PricingBreakdown 
} from '@/types/policySettings';

interface UsePricingCalculationProps {
  basePrice: number;
  participants: number;
  daysUntilTour: number;
  earlyBirdSettings?: EarlyBirdSettings;
  groupSettings?: GroupDiscountSettings;
  lastMinuteSettings?: LastMinuteSettings;
  discountsDisabled?: boolean;
  depositType: 'percentage' | 'fixed';
  depositAmount: number;
}

export function usePricingCalculation({
  basePrice,
  participants,
  daysUntilTour,
  earlyBirdSettings,
  groupSettings,
  lastMinuteSettings,
  discountsDisabled = false,
  depositType,
  depositAmount,
}: UsePricingCalculationProps): PricingBreakdown {
  return useMemo(() => {
    if (discountsDisabled || basePrice <= 0) {
      const deposit = depositType === 'percentage' 
        ? basePrice * (depositAmount / 100)
        : depositAmount;

      return {
        basePrice,
        earlyBirdDiscount: 0,
        groupDiscount: 0,
        lastMinuteDiscount: 0,
        totalDiscount: 0,
        finalPrice: basePrice,
        depositAmount: Math.min(deposit, basePrice),
        finalPaymentAmount: basePrice - Math.min(deposit, basePrice),
      };
    }

    let currentPrice = basePrice;
    let earlyBirdDiscount = 0;
    let groupDiscount = 0;
    let lastMinuteDiscount = 0;

    // Apply early bird discount
    if (earlyBirdSettings?.enabled) {
      const { tier1_days, tier1_percent, tier2_days, tier2_percent, tier3_days, tier3_percent } = earlyBirdSettings;
      
      if (daysUntilTour >= tier1_days) {
        earlyBirdDiscount = currentPrice * (tier1_percent / 100);
      } else if (daysUntilTour >= tier2_days) {
        earlyBirdDiscount = currentPrice * (tier2_percent / 100);
      } else if (daysUntilTour >= tier3_days) {
        earlyBirdDiscount = currentPrice * (tier3_percent / 100);
      }
      
      currentPrice -= earlyBirdDiscount;
    }

    // Apply group discount
    if (groupSettings?.enabled && participants > 1) {
      const { tier1_min, tier1_max, tier1_percent, tier2_min, tier2_max, tier2_percent, tier3_min, tier3_percent } = groupSettings;
      
      if (participants >= tier3_min) {
        groupDiscount = currentPrice * (tier3_percent / 100);
      } else if (participants >= tier2_min && participants <= tier2_max) {
        groupDiscount = currentPrice * (tier2_percent / 100);
      } else if (participants >= tier1_min && participants <= tier1_max) {
        groupDiscount = currentPrice * (tier1_percent / 100);
      }
      
      currentPrice -= groupDiscount;
    }

    // Apply last minute discount (mutually exclusive with early bird for same booking)
    if (lastMinuteSettings?.enabled && !earlyBirdDiscount) {
      const hoursUntilTour = daysUntilTour * 24;
      if (hoursUntilTour <= lastMinuteSettings.hours) {
        lastMinuteDiscount = currentPrice * (lastMinuteSettings.percent / 100);
        currentPrice -= lastMinuteDiscount;
      }
    }

    // Cap total discount at 40%
    const totalDiscount = earlyBirdDiscount + groupDiscount + lastMinuteDiscount;
    const maxDiscount = basePrice * 0.4;
    
    if (totalDiscount > maxDiscount) {
      const ratio = maxDiscount / totalDiscount;
      currentPrice = basePrice - maxDiscount;
    }

    // Ensure minimum price of €20
    const finalPrice = Math.max(currentPrice, 20);

    // Calculate deposit
    const deposit = depositType === 'percentage'
      ? finalPrice * (depositAmount / 100)
      : depositAmount;

    const depositAmountFinal = Math.min(deposit, finalPrice);
    const finalPaymentAmount = finalPrice - depositAmountFinal;

    return {
      basePrice,
      earlyBirdDiscount,
      groupDiscount,
      lastMinuteDiscount,
      totalDiscount: basePrice - finalPrice,
      finalPrice,
      depositAmount: depositAmountFinal,
      finalPaymentAmount,
    };
  }, [
    basePrice,
    participants,
    daysUntilTour,
    earlyBirdSettings,
    groupSettings,
    lastMinuteSettings,
    discountsDisabled,
    depositType,
    depositAmount,
  ]);
}
