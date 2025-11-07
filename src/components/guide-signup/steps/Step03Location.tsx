import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GuideSignupData } from '@/types/guide';
import { LocationAutocomplete } from '@/components/tour-creation/LocationAutocomplete';

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
    if (data.location?.trim() && data.country) onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
            <MapPin className="w-5 h-5 text-burgundy" />
            Your Location
          </CardTitle>
          <p className="text-muted-foreground">Where are you based?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="country">Country for Payment Account *</Label>
            <Select
              value={data.country || ''}
              onValueChange={(value) => updateData({ country: value })}
            >
              <SelectTrigger>
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
              This is used for your Stripe payment account and cannot be changed later
            </p>
          </div>

          <div>
            <Label htmlFor="location">City, Country *</Label>
            <LocationAutocomplete
              value={data.location || ''}
              coordinates={{
                lat: data.location_lat || 0,
                lng: data.location_lng || 0
              }}
              onLocationSelect={(locationData) => {
                updateData({
                  location: locationData.address,
                  location_lat: locationData.lat,
                  location_lng: locationData.lng,
                  location_formatted: locationData.formatted
                });
              }}
              placeholder="Search for your base location..."
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={handleNext} disabled={!data.location?.trim() || !data.country} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
