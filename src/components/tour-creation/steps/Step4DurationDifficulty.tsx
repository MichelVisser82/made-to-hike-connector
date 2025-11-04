import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import DurationSlider from '@/components/tour-creation/DurationSlider';

interface Step4DurationDifficultyProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

const difficultyLevels = [
  { value: 'easy', label: 'A - Easy', description: 'Suitable for beginners, gentle terrain' },
  { value: 'moderate', label: 'B - Moderate', description: 'Some hiking experience required' },
  { value: 'challenging', label: 'C - Challenging', description: 'For experienced hikers, steep sections' },
  { value: 'expert', label: 'D - Expert', description: 'Very demanding, technical skills needed' },
];

export default function Step4DurationDifficulty({ onSave, onNext, onPrev, isSaving }: Step4DurationDifficultyProps) {
  const form = useFormContext<TourFormData>();

  const handleSave = async () => {
    const isValid = await form.trigger(['duration', 'difficulty']);
    if (isValid && onSave) await onSave();
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['duration', 'difficulty']);
    if (isValid && onNext) await onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duration & Difficulty</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How long is this tour?</FormLabel>
              <DurationSlider
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty Level</FormLabel>
              <p className="text-sm text-muted-foreground mb-3">(Pick the most difficult terrain you will encounter)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => field.onChange(level.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      field.value === level.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold mb-1">{level.label}</div>
                    <div className="text-sm text-muted-foreground">{level.description}</div>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          {onPrev && (
            <Button type="button" variant="outline" onClick={onPrev}>
              Previous
            </Button>
          )}
          <div className="flex-1" />
          {onNext ? (
            <Button onClick={handleNext} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Next'}
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Progress'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
