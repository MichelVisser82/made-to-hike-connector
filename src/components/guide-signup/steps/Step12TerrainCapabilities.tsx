import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GuideSignupData } from '@/types/guide';

interface Step12TerrainCapabilitiesProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const terrainOptions = [
  'High Alpine', 'Rock Climbing', 'Scrambling', 'Snow & Ice',
  'Glacier Trekking', 'Via Ferrata', 'Ridge Walking', 'Forest Trails',
  'Coastal Paths', 'Desert Hiking'
];

export function Step12TerrainCapabilities({ data, updateData, onNext, onBack }: Step12TerrainCapabilitiesProps) {
  const selected = data.terrain_capabilities || [];

  const toggleTerrain = (terrain: string) => {
    const newSelected = selected.includes(terrain)
      ? selected.filter(t => t !== terrain)
      : [...selected, terrain];
    updateData({ terrain_capabilities: newSelected });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Terrain Capabilities</CardTitle>
          <p className="text-muted-foreground">What types of terrain do you guide on?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {terrainOptions.map((terrain) => {
              const isSelected = selected.includes(terrain);
              return (
                <Badge
                  key={terrain}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer py-3 justify-start text-sm hover:bg-muted"
                  onClick={() => toggleTerrain(terrain)}
                >
                  {isSelected && <Check className="w-4 h-4 mr-2" />}
                  {terrain}
                </Badge>
              );
            })}
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
