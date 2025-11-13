import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Utensils, Accessibility, FileText } from 'lucide-react';

interface SpecialRequestsStepProps {
  form: UseFormReturn<BookingFormData>;
  onNext: () => void;
  onBack: () => void;
}

const dietaryOptions = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

export const SpecialRequestsStep = ({ form, onNext, onBack }: SpecialRequestsStepProps) => {
  const dietaryPreferences = form.watch('dietaryPreferences') || [];

  const toggleDietary = (value: string) => {
    const normalizedValue = value.toLowerCase();
    const current = dietaryPreferences;
    if (current.includes(normalizedValue)) {
      form.setValue('dietaryPreferences', current.filter((v) => v !== normalizedValue));
    } else {
      form.setValue('dietaryPreferences', [...current, normalizedValue]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Special Requests</h2>
        <p className="text-muted-foreground">
          Help us make your experience perfect by sharing any special requirements
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold">Dietary Preferences</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dietaryOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={dietaryPreferences.includes(option.value)}
                  onCheckedChange={() => toggleDietary(option.value)}
                />
                <label
                  htmlFor={option.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Accessibility className="h-5 w-5 text-primary" />
            <Label htmlFor="accessibilityNeeds" className="text-lg font-semibold">
              Accessibility Needs
            </Label>
          </div>
          <Textarea
            id="accessibilityNeeds"
            {...form.register('accessibilityNeeds')}
            placeholder="Please describe any accessibility requirements or mobility concerns"
            rows={3}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <Label htmlFor="specialRequests" className="text-lg font-semibold">
              Additional Notes for Guide
            </Label>
          </div>
          <Textarea
            id="specialRequests"
            {...form.register('specialRequests')}
            placeholder="Any other information or requests you'd like to share with your guide"
            rows={4}
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {form.watch('specialRequests')?.length || 0} / 500 characters
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          Continue to Review
        </Button>
      </div>
    </div>
  );
};
