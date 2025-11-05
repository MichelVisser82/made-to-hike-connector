import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingDown } from 'lucide-react';
import { PricingBreakdown } from '@/types/policySettings';

interface PricingPreviewProps {
  breakdown: PricingBreakdown;
  currency?: string;
}

export function PricingPreview({ breakdown, currency = 'EUR' }: PricingPreviewProps) {
  const hasDiscounts = breakdown.totalDiscount > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-playfair text-charcoal flex items-center gap-2">
          <Euro className="w-5 h-5 text-burgundy" />
          Pricing Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Base Price:</span>
          <span className="font-medium">€{breakdown.basePrice.toFixed(2)}</span>
        </div>

        {/* Discounts */}
        {hasDiscounts && (
          <div className="space-y-2 py-2 border-t border-b">
            {breakdown.earlyBirdDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Early Bird Discount
                </span>
                <span className="text-green-600">-€{breakdown.earlyBirdDiscount.toFixed(2)}</span>
              </div>
            )}
            {breakdown.groupDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Group Discount
                </span>
                <span className="text-green-600">-€{breakdown.groupDiscount.toFixed(2)}</span>
              </div>
            )}
            {breakdown.lastMinuteDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Last-Minute Discount
                </span>
                <span className="text-green-600">-€{breakdown.lastMinuteDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Final Price */}
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Final Price:</span>
          <div className="flex items-center gap-2">
            {hasDiscounts && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {((breakdown.totalDiscount / breakdown.basePrice) * 100).toFixed(0)}% off
              </Badge>
            )}
            <span className="text-burgundy">€{breakdown.finalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Schedule - Only show when deposit is required */}
        {breakdown.depositAmount > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="text-sm font-medium">Payment Schedule:</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deposit (at booking):</span>
              <span className="font-medium">€{breakdown.depositAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Final Payment:</span>
              <span className="font-medium">€{breakdown.finalPaymentAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
