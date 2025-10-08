import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GuideSignupData } from '@/types/guide';

interface Step03LocationProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step03Location({ data, updateData, onNext, onBack }: Step03LocationProps) {
  const handleNext = () => {
    if (data.location?.trim()) onNext();
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
            <Label htmlFor="location">City, Country *</Label>
            <Input
              id="location"
              value={data.location || ''}
              onChange={(e) => updateData({ location: e.target.value })}
              placeholder="e.g., Edinburgh, Scotland"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={handleNext} disabled={!data.location?.trim()} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
