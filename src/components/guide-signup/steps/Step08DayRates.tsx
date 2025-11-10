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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal flex items-center gap-2" style={{fontFamily: 'Playfair Display, serif'}}>
            <DollarSign className="w-5 h-5 text-burgundy" />
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
                value={data.daily_rate ?? ''}
                onChange={(e) => updateData({ daily_rate: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
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
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={onNext} disabled={!data.daily_rate || data.daily_rate <= 0} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
