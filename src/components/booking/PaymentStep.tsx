import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormData, PricingDetails } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, X, CreditCard, Smartphone, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useGuidePolicyDefaults } from '@/hooks/useGuidePolicyDefaults';

interface PaymentStepProps {
  form: UseFormReturn<BookingFormData>;
  tourId: string;
  guideId: string;
  pricing: PricingDetails;
  onUpdatePricing: (newPricing: PricingDetails) => void;
  onBack: () => void;
  onPaymentSuccess: (clientSecret: string) => void;
}

export const PaymentStep = ({
  form,
  tourId,
  guideId,
  pricing,
  onUpdatePricing,
  onBack,
  onPaymentSuccess
}: PaymentStepProps) => {
  const [discountCode, setDiscountCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeApplied, setCodeApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [finalPaymentAmount, setFinalPaymentAmount] = useState(0);
  const [depositInfo, setDepositInfo] = useState<string>('');

  const agreedToTerms = form.watch('agreedToTerms');
  const { defaults, isLoading: isPolicyLoading } = useGuidePolicyDefaults(guideId);

  // Calculate deposit amount based on guide's policy defaults
  useEffect(() => {
    if (!defaults || isPolicyLoading) return;

    const finalPrice = pricing.subtotal - pricing.discount;

    if (defaults.deposit_type === 'none') {
      // Full payment required
      setDepositAmount(0);
      setFinalPaymentAmount(0);
      setDepositInfo('Full payment required at booking');
    } else if (defaults.deposit_type === 'percentage') {
      // Calculate deposit as percentage
      const depositPercent = defaults.deposit_amount || 30;
      const deposit = Math.round((finalPrice * depositPercent) / 100);
      setDepositAmount(deposit);
      setFinalPaymentAmount(finalPrice - deposit);
      setDepositInfo(`${depositPercent}% deposit (${pricing.currency}${deposit}) + ${pricing.currency}${pricing.serviceFee.toFixed(2)} service fee due now. Remaining ${pricing.currency}${finalPrice - deposit} due ${defaults.final_payment_days || 14} days before tour.`);
    }
  }, [defaults, isPolicyLoading, pricing, guideId]);

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setCodeError('Please enter a discount code');
      return;
    }

    setIsValidatingCode(true);
    setCodeError('');

    try {
      const { data, error } = await supabase.rpc('validate_discount_code', {
        p_code: discountCode.trim().toUpperCase(),
        p_tour_id: tourId,
        p_guide_id: guideId,
        p_subtotal: pricing.subtotal
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        if (result.is_valid) {
          const newDiscount = pricing.discount + result.discount_amount;
          const newTotal = pricing.subtotal - newDiscount + pricing.serviceFee;
          
          onUpdatePricing({
            ...pricing,
            discount: newDiscount,
            total: newTotal
          });

          (form.setValue as any)('discountCode', discountCode.trim().toUpperCase());
          setCodeApplied(true);
          toast.success(`Discount applied! You saved €${result.discount_amount.toFixed(2)}`);
        } else {
          setCodeError(result.error_message || 'Invalid discount code');
        }
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setCodeError('Failed to validate discount code');
    } finally {
      setIsValidatingCode(false);
    }
  };

  const removeDiscountCode = () => {
    const baseDiscount = pricing.slotDiscount || 0;
    const newTotal = pricing.subtotal - baseDiscount + pricing.serviceFee;
    
    onUpdatePricing({
      ...pricing,
      discount: baseDiscount,
      total: newTotal
    });

    setDiscountCode('');
    setCodeApplied(false);
    setCodeError('');
    (form.setValue as any)('discountCode', undefined);
    toast.info('Discount code removed');
  };

  const handleCompleteBooking = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (!guideId) {
      console.error('[PaymentStep] ERROR: Missing guideId', { tourId, guideId });
      toast.error('Guide information is missing. Please go back and try again, or contact support if the issue persists.');
      return;
    }

    if (!tourId) {
      console.error('[PaymentStep] ERROR: Missing tourId');
      toast.error('Tour information is missing. Please refresh the page.');
      return;
    }

    setIsProcessing(true);

    try {
      // Get the full booking data from form
      const fullBookingData = form.getValues();
      
      if (!fullBookingData.selectedDateSlotId) {
        throw new Error('Please select a date for your tour');
      }

      const finalPrice = pricing.subtotal - pricing.discount;
      const amountToCharge = depositAmount > 0 ? depositAmount : finalPrice;
      const totalToCharge = amountToCharge + pricing.serviceFee;

      const paymentPayload = {
        amount: amountToCharge, // Deposit or full price (after discount, before service fee)
        serviceFee: pricing.serviceFee, // Pre-calculated service fee
        totalAmount: totalToCharge, // Total to charge (deposit/full price + service fee)
        currency: pricing.currency,
        tourId: tourId,
        guideId: guideId,
        dateSlotId: fullBookingData.selectedDateSlotId,
        tourTitle: `Hiking Tour Booking`,
        isDeposit: depositAmount > 0,
        depositAmount: depositAmount,
        finalPaymentAmount: finalPaymentAmount,
        bookingData: {
          participants: fullBookingData.participants,
          participantCount: fullBookingData.participants.length,
          phone: fullBookingData.phone,
          country: fullBookingData.country,
          emergencyContactName: fullBookingData.emergencyContactName,
          emergencyContactPhone: fullBookingData.emergencyContactPhone,
          emergencyContactRelationship: fullBookingData.emergencyContactRelationship,
          dietaryPreferences: fullBookingData.dietaryPreferences,
          accessibilityNeeds: fullBookingData.accessibilityNeeds,
          specialRequests: fullBookingData.specialRequests,
          subtotal: pricing.subtotal,
          discount_code: fullBookingData.discountCode || null,
          discount_amount: pricing.discount,
          service_fee_amount: pricing.serviceFee,
          total_price: pricing.total,
          deposit_amount: depositAmount,
          final_payment_amount: finalPaymentAmount,
          final_payment_days: defaults?.final_payment_days || 0,
          tour_id: tourId,
          date_slot_id: fullBookingData.selectedDateSlotId,
          currency: pricing.currency,
        }
      };

      console.log('[PaymentStep] Sending payment request:', paymentPayload);

      // Create Stripe Checkout Session
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: paymentPayload
      });

      console.log('[PaymentStep] Payment response:', { data, error });

      if (error) {
        console.error('[PaymentStep] Edge function error:', error);
        
        // Extract the actual error message from the response
        let errorMsg = 'Failed to initiate payment. Please try again.';
        
        if (data?.error) {
          errorMsg = data.error;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        toast.error(errorMsg);
        return;
      }

      if (!data?.url) {
        console.error('[PaymentStep] No checkout URL returned:', data);
        
        // Check if there's an error in the data object
        if (data?.error) {
          toast.error(data.error);
        } else {
          toast.error('Failed to initialize payment session. Please try again.');
        }
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error: any) {
      console.error('[PaymentStep] Payment error:', error);
      const errorMsg = error?.message || 'An error occurred during payment processing';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment</h2>
        <p className="text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Discount Code */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Discount Code</Label>
            {!codeApplied ? (
              <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter discount code"
                  disabled={isValidatingCode}
                />
                <Button
                  onClick={validateDiscountCode}
                  disabled={isValidatingCode || !discountCode.trim()}
                >
                  {isValidatingCode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">{discountCode}</span>
                  <Badge variant="secondary">Applied</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={removeDiscountCode}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {codeError && (
              <p className="text-sm text-destructive mt-2">{codeError}</p>
            )}
          </Card>

          {/* Payment Methods Info */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Payment Methods</Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We'll redirect you to our secure payment partner, Stripe, where you can complete your booking using the payment method that works best for you. {depositAmount > 0 ? 'For deposit payments, card and SEPA direct debit are available to enable automatic final payment collection.' : 'Multiple payment options including cards, digital wallets, and local payment methods are available.'} All transactions are encrypted and protected.
            </p>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                🔒 Your payment information is secure and encrypted. We use Stripe to process payments safely. Available payment methods will be shown based on your location at checkout.
              </p>
            </div>
          </Card>

          {/* Terms and Conditions */}
          <Card className="p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => form.setValue('agreedToTerms', checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-primary underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-primary underline">
                  Privacy Policy
                </a>
                . I understand that this booking is subject to the guide's availability and confirmation.
              </label>
            </div>
            {form.formState.errors.agreedToTerms && (
              <p className="text-sm text-destructive mt-2">
                {form.formState.errors.agreedToTerms.message}
              </p>
            )}
          </Card>
        </div>

        {/* Pricing Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                  {pricing.subtotal.toFixed(2)}
                </span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>
                    -{pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                    {pricing.discount.toFixed(2)}
                  </span>
                </div>
              )}

              <Separator />

              {depositAmount > 0 ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit Due Now</span>
                    <span className="font-medium">
                      {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                      {depositAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">
                      {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                      {pricing.serviceFee.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Due Now</span>
                    <span className="text-primary">
                      {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                      {(depositAmount + pricing.serviceFee).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Due Later</span>
                    <span>
                      {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                      {finalPaymentAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">
                      {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                      {pricing.serviceFee.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Due Now</span>
                    <span className="text-primary">
                      {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                      {pricing.total.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {depositInfo && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {depositInfo} The remaining balance will be automatically charged to your payment method on the due date.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleCompleteBooking}
              disabled={!agreedToTerms || isProcessing || isPolicyLoading}
              className="w-full mt-6"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isPolicyLoading ? (
                'Loading payment info...'
              ) : (
                `Pay ${pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}${depositAmount > 0 ? (depositAmount + pricing.serviceFee).toFixed(2) : pricing.total.toFixed(2)}`
              )}
            </Button>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
      </div>
    </div>
  );
};
