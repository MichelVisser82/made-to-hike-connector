import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GuideSignupData } from '@/types/guide';

interface Step05DifficultyLevelsProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const difficultyOptions = [
  { value: 'easy', label: 'Easy', description: 'Suitable for beginners' },
  { value: 'moderate', label: 'Moderate', description: 'Some experience required' },
  { value: 'challenging', label: 'Challenging', description: 'Advanced skills needed' },
  { value: 'expert', label: 'Expert', description: 'For experienced mountaineers' },
];

export function Step05DifficultyLevels({ data, updateData, onNext, onBack }: Step05DifficultyLevelsProps) {
  const selected = data.difficulty_levels || [];

  const toggleDifficulty = (difficulty: string) => {
    const newSelected = selected.includes(difficulty)
      ? selected.filter(d => d !== difficulty)
      : [...selected, difficulty];
    updateData({ difficulty_levels: newSelected });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-serif text-charcoal" style={{fontFamily: 'Playfair Display, serif'}}>Difficulty Levels</CardTitle>
          <p className="text-muted-foreground">What difficulty levels do you guide?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {difficultyOptions.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => toggleDifficulty(option.value)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </CardContent>
                </Card>
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
