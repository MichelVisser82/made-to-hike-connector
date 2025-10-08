import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GuideSignupData } from '@/types/guide';

interface Step04SpecialtiesProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const specialtyOptions = [
  'Rock Climbing', 'Mountaineering', 'Winter Hiking', 'Ice Climbing',
  'Scrambling', 'Alpine Touring', 'Trekking', 'Backpacking',
  'Wildlife Watching', 'Photography Tours', 'Multi-day Expeditions'
];

export function Step04Specialties({ data, updateData, onNext, onBack }: Step04SpecialtiesProps) {
  const selected = data.specialties || [];

  const toggleSpecialty = (specialty: string) => {
    const newSelected = selected.includes(specialty)
      ? selected.filter(s => s !== specialty)
      : [...selected, specialty];
    updateData({ specialties: newSelected });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>Your Specialties</CardTitle>
          <p className="text-muted-foreground">Select all that apply (minimum 1)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {specialtyOptions.map((specialty) => {
              const isSelected = selected.includes(specialty);
              return (
                <Badge
                  key={specialty}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer py-3 justify-start text-sm hover:bg-muted"
                  onClick={() => toggleSpecialty(specialty)}
                >
                  {isSelected && <Check className="w-4 h-4 mr-2" />}
                  {specialty}
                </Badge>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="border-burgundy text-burgundy hover:bg-burgundy/10">Back</Button>
            <Button onClick={onNext} disabled={selected.length === 0} className="bg-burgundy hover:bg-burgundy/90 text-white">Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
