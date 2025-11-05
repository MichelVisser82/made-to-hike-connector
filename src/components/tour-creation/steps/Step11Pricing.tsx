import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { TourPolicyOverrides } from '@/components/tour-creation/policy/TourPolicyOverrides';
import { TourPolicyOverrides as TourPolicyOverridesType } from '@/types/policySettings';

interface Step11PricingProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

export default function Step11Pricing({ onSave, onNext, onPrev, isSaving }: Step11PricingProps) {
  const form = useFormContext<TourFormData>();

  const handleSave = async () => {
    const isValid = await form.trigger(['price', 'currency', 'group_size']);
    if (isValid && onSave) await onSave();
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['price', 'currency', 'group_size']);
    if (isValid && onNext) await onNext();
  };

  const price = form.watch('price') || 0;
  const policyOverrides = form.watch('policy_overrides') || {
    using_default_cancellation: true,
    using_default_discounts: true,
    discounts_disabled: false,
    using_default_payment: true,
  };

  return (
    <Card className="border-l-4 border-l-burgundy">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair text-charcoal">Pricing</CardTitle>
        <p className="text-sm text-charcoal/60 mt-2">Set your tour pricing and configure payment policies</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-charcoal font-medium">Base Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    placeholder="0"
                    className="border-burgundy/20 focus:border-burgundy"
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-charcoal font-medium">Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-burgundy/20">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="group_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-charcoal font-medium">Maximum Group Size</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  max="20"
                  className="border-burgundy/20 focus:border-burgundy"
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Summary */}
        <Card className="bg-cream/50 border-burgundy/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-semibold text-charcoal">
                <span>Price per person:</span>
                <span className="text-burgundy">
                  {form.watch('currency') === 'EUR' ? '€' : '£'}{price.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tour-Specific Policy Settings */}
        <div className="pt-6 border-t border-burgundy/10">
          <h3 className="text-lg font-playfair text-charcoal mb-2">Cancellation & Discount Settings</h3>
          <p className="text-sm text-charcoal/60 mb-4">
            Choose whether to use your default policies or customize settings specifically for this tour.
          </p>
          <TourPolicyOverrides
            tourPrice={price}
            overrides={policyOverrides as TourPolicyOverridesType}
            onChange={(newOverrides) => {
              form.setValue('policy_overrides', newOverrides);
            }}
          />
        </div>
        <div className="flex justify-between pt-4 border-t border-burgundy/10">
          {onPrev && (
            <Button type="button" variant="outline" onClick={onPrev} className="border-burgundy/20 text-charcoal hover:bg-cream">
              Previous
            </Button>
          )}
          <div className="flex-1" />
          {onNext ? (
            <Button onClick={handleNext} disabled={isSaving} className="bg-burgundy hover:bg-burgundy-dark text-white">
              {isSaving ? 'Saving...' : 'Next'}
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving} className="bg-burgundy hover:bg-burgundy-dark text-white">
              {isSaving ? 'Saving...' : 'Save Progress'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
