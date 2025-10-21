import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Phone, MapPin, AlertCircle } from 'lucide-react';

interface ContactStepProps {
  form: UseFormReturn<BookingFormData>;
  onNext: () => void;
  onBack: () => void;
}

const countries = [
  { code: '+1', name: 'United States/Canada' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+33', name: 'France' },
  { code: '+49', name: 'Germany' },
  { code: '+39', name: 'Italy' },
  { code: '+34', name: 'Spain' },
  { code: '+31', name: 'Netherlands' },
  { code: '+32', name: 'Belgium' },
  { code: '+41', name: 'Switzerland' },
  { code: '+43', name: 'Austria' },
  { code: '+351', name: 'Portugal' },
  { code: '+353', name: 'Ireland' },
  { code: '+45', name: 'Denmark' },
  { code: '+46', name: 'Sweden' },
  { code: '+47', name: 'Norway' },
  { code: '+358', name: 'Finland' },
  { code: '+48', name: 'Poland' },
  { code: '+420', name: 'Czech Republic' },
];

export const ContactStep = ({ form, onNext, onBack }: ContactStepProps) => {
  const handleNext = async () => {
    const valid = await form.trigger(['phone', 'country', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship']);
    if (valid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
        <p className="text-muted-foreground">
          We need your contact details for booking confirmation and emergencies
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Your Contact Details</h3>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="country">Country Code</Label>
              <Select
                value={form.watch('country')}
                onValueChange={(value) => form.setValue('country', value)}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country code" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.code} - {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.country && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="Enter your phone number"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Emergency Contact</h3>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                {...form.register('emergencyContactName')}
                placeholder="Full name of emergency contact"
              />
              {form.formState.errors.emergencyContactName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.emergencyContactName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                {...form.register('emergencyContactPhone')}
                placeholder="Phone number with country code"
              />
              {form.formState.errors.emergencyContactPhone && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.emergencyContactPhone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyContactRelationship">Relationship</Label>
              <Select
                value={form.watch('emergencyContactRelationship')}
                onValueChange={(value) => form.setValue('emergencyContactRelationship', value)}
              >
                <SelectTrigger id="emergencyContactRelationship">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.emergencyContactRelationship && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.emergencyContactRelationship.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} size="lg">
          Continue to Select Date
        </Button>
      </div>
    </div>
  );
};
