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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-6 h-6" />
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
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={handleNext} disabled={!data.location?.trim()}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
