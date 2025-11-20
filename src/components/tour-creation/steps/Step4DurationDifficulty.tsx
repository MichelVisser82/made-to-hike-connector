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
    <Card className="border-l-4 border-l-burgundy shadow-elegant">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair text-charcoal">Duration & Difficulty</CardTitle>
        <p className="text-sm text-charcoal/60 mt-2">Define how long your tour lasts and its difficulty level</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-charcoal font-medium">How long is this tour?</FormLabel>
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
              <FormLabel className="text-charcoal font-medium">Difficulty Level</FormLabel>
              <p className="text-sm text-charcoal/60 mb-3">(Pick the most difficult terrain you will encounter)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => field.onChange(level.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      field.value === level.value
                        ? 'border-burgundy bg-burgundy/5'
                        : 'border-burgundy/20 hover:border-burgundy/50 hover:bg-cream'
                    }`}
                  >
                    <div className="font-semibold text-charcoal mb-1">{level.label}</div>
                    <div className="text-sm text-charcoal/60">{level.description}</div>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4 border-t border-burgundy/10">
          {onPrev && (
            <Button type="button" variant="outline" onClick={onPrev} className="border-burgundy/20">
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
