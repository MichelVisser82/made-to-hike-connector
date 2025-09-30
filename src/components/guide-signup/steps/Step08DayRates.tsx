import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GuideSignupData } from '@/types/guide';

interface Step08DayRatesProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step08DayRates({ data, updateData, onNext, onBack }: Step08DayRatesProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Day Rates
          </CardTitle>
          <p className="text-muted-foreground">Set your daily guiding rate</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Label htmlFor="daily_rate">Daily Rate *</Label>
              <Input
                id="daily_rate"
                type="number"
                min="0"
                value={data.daily_rate || ''}
                onChange={(e) => updateData({ daily_rate: parseFloat(e.target.value) || 0 })}
                placeholder="250"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={data.daily_rate_currency || 'EUR'}
                onValueChange={(value: 'EUR' | 'GBP') => updateData({ daily_rate_currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={onNext} disabled={!data.daily_rate || data.daily_rate <= 0}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
