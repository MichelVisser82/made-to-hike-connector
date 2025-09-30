import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GuideSignupData } from '@/types/guide';

interface Step11GuidingAreasProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const areaOptions = [
  'Scottish Highlands', 'Cairngorms', 'Ben Nevis', 'Skye', 'Glencoe',
  'Dolomites', 'Alps', 'Pyrenees', 'Lake District', 'Snowdonia',
  'Peak District', 'Yorkshire Dales'
];

export function Step11GuidingAreas({ data, updateData, onNext, onBack }: Step11GuidingAreasProps) {
  const selected = data.guiding_areas || [];

  const toggleArea = (area: string) => {
    const newSelected = selected.includes(area)
      ? selected.filter(a => a !== area)
      : [...selected, area];
    updateData({ guiding_areas: newSelected });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Guiding Areas</CardTitle>
          <p className="text-muted-foreground">Where do you guide? (select at least 1)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {areaOptions.map((area) => {
              const isSelected = selected.includes(area);
              return (
                <Badge
                  key={area}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer py-3 justify-start text-sm hover:bg-muted"
                  onClick={() => toggleArea(area)}
                >
                  {isSelected && <Check className="w-4 h-4 mr-2" />}
                  {area}
                </Badge>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={onNext} disabled={selected.length === 0}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
