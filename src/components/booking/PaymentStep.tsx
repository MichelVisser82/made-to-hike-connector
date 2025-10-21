import { useState } from 'react';
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
import { Loader2, Check, X, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

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

  const agreedToTerms = form.watch('agreedToTerms');

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

    setIsProcessing(true);

    try {
      const bookingData = form.getValues();
      
      // Create Stripe Payment Intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: pricing.total,
          currency: pricing.currency,
          tourId: tourId,
          tourTitle: bookingData.participants.length > 0 
            ? `Booking for ${bookingData.participants[0].firstName} ${bookingData.participants[0].surname}`
            : 'Tour Booking',
          bookingData: {
            participants: bookingData.participants,
            participantCount: bookingData.participants.length
          }
        }
      });

      if (error) throw error;

      if (data?.clientSecret) {
        onPaymentSuccess(data.clientSecret);
      } else {
        throw new Error('No client secret returned');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initiate payment. Please try again.');
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
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Credit or Debit Card</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Smartphone className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Digital Wallets</p>
                  <p className="text-sm text-muted-foreground">Apple Pay, Google Pay</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                🔒 Your payment information is secure and encrypted. We use Stripe to process payments safely.
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

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Made To Hike Service Fee</span>
                <span className="font-medium">
                  {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                  {pricing.serviceFee.toFixed(2)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {pricing.currency === 'EUR' ? '€' : pricing.currency === 'GBP' ? '£' : '$'}
                  {pricing.total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCompleteBooking}
              disabled={!agreedToTerms || isProcessing}
              className="w-full mt-6"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Complete Booking`
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
