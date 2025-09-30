import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GuideSignupData } from '@/types/guide';

interface Step13BioProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step13Bio({ data, updateData, onNext, onBack }: Step13BioProps) {
  const bio = data.bio || '';
  const charCount = bio.length;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Your Bio
          </CardTitle>
          <p className="text-muted-foreground">Tell hikers about yourself (300-500 characters)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => updateData({ bio: e.target.value })}
              placeholder="Share your passion for the mountains, your experience, and what makes your tours special..."
              className="min-h-[200px]"
              maxLength={500}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {charCount}/500 characters
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={onNext} disabled={charCount < 300 || charCount > 500}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
