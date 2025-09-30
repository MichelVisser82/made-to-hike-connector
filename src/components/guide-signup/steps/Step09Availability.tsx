import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GuideSignupData } from '@/types/guide';

interface Step09AvailabilityProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step09Availability({ data, updateData, onNext, onBack }: Step09AvailabilityProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Availability
          </CardTitle>
          <p className="text-muted-foreground">When are you typically available to guide?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="seasonal_availability">Seasonal Availability</Label>
            <Textarea
              id="seasonal_availability"
              value={data.seasonal_availability || ''}
              onChange={(e) => updateData({ seasonal_availability: e.target.value })}
              placeholder="e.g., Year-round, best conditions June-September"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="upcoming_start">Upcoming Start Date</Label>
              <Input
                id="upcoming_start"
                type="date"
                value={data.upcoming_availability_start || ''}
                onChange={(e) => updateData({ upcoming_availability_start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="upcoming_end">Upcoming End Date</Label>
              <Input
                id="upcoming_end"
                type="date"
                value={data.upcoming_availability_end || ''}
                onChange={(e) => updateData({ upcoming_availability_end: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={onNext}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
