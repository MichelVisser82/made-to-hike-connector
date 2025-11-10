import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GuideSignupData } from '@/types/guide';

interface Step07GroupPreferencesProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step07GroupPreferences({ data, updateData, onNext, onBack }: Step07GroupPreferencesProps) {
  const minSize = data.min_group_size ?? '';
  const maxSize = data.max_group_size ?? '';

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
            <Users className="w-5 h-5 text-burgundy" />
            Group Size Preferences
          </CardTitle>
          <p className="text-muted-foreground">What group sizes do you prefer to guide?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_group_size">Minimum Group Size *</Label>
              <Input
                id="min_group_size"
                type="number"
                min="1"
                value={minSize}
                onChange={(e) => updateData({ min_group_size: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="max_group_size">Maximum Group Size *</Label>
              <Input
                id="max_group_size"
                type="number"
                min={minSize || 1}
                value={maxSize}
                onChange={(e) => updateData({ max_group_size: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })}
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={onNext} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
