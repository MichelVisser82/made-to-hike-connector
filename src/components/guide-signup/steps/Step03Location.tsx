import { MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { GuideSignupData } from '@/types/guide';

// Stripe-supported countries for Connect accounts
const STRIPE_COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

interface Step03LocationProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step03Location({ data, updateData, onNext, onBack }: Step03LocationProps) {
  const handleNext = () => {
    if (data.country && data.address_line1?.trim() && 
        data.address_city?.trim() && data.address_postal_code?.trim()) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
            <MapPin className="w-5 h-5 text-burgundy" />
            Contact Information
          </CardTitle>
          <p className="text-muted-foreground">Required for payment account setup and identity verification</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Country Selection */}
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select
              value={data.country || ''}
              onValueChange={(value) => updateData({ country: value })}
            >
              <SelectTrigger className="border-burgundy/20">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {STRIPE_COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              This is used for your Stripe payment account
            </p>
          </div>


          {/* Street Address */}
          <div>
            <Label htmlFor="address-line1">Street Address *</Label>
            <Input
              id="address-line1"
              value={data.address_line1 || ''}
              onChange={(e) => updateData({ address_line1: e.target.value })}
              placeholder="123 Main Street"
              className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
              maxLength={200}
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <Label htmlFor="address-line2">Apartment, Suite, etc. (Optional)</Label>
            <Input
              id="address-line2"
              value={data.address_line2 || ''}
              onChange={(e) => updateData({ address_line2: e.target.value })}
              placeholder="Apt 4B"
              className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
              maxLength={200}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.address_city || ''}
                onChange={(e) => updateData({ address_city: e.target.value })}
                placeholder="Munich"
                className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                maxLength={100}
              />
            </div>

            {/* State/Province */}
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={data.address_state || ''}
                onChange={(e) => updateData({ address_state: e.target.value })}
                placeholder="Bavaria"
                className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                maxLength={100}
              />
            </div>

            {/* Postal Code */}
            <div>
              <Label htmlFor="postal-code">Postal Code *</Label>
              <Input
                id="postal-code"
                value={data.address_postal_code || ''}
                onChange={(e) => updateData({ address_postal_code: e.target.value })}
                placeholder="80331"
                className="border-burgundy/20 focus:border-burgundy focus:ring-burgundy/20"
                maxLength={20}
              />
            </div>
          </div>

          <Alert className="border-burgundy/20 bg-burgundy/5">
            <AlertCircle className="h-4 w-4 text-burgundy" />
            <AlertDescription className="text-sm">
              This information is required by Stripe for identity verification and tax compliance.
              It will be securely stored and only shared with Stripe.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!data.country || !data.address_line1?.trim() || 
                       !data.address_city?.trim() || !data.address_postal_code?.trim()}
              className="bg-burgundy hover:bg-burgundy/90 text-white"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
