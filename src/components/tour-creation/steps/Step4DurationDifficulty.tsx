import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';

interface Step4DurationDifficultyProps {
  onNext: () => void;
  onPrev: () => void;
}

const difficultyLevels = [
  { value: 'easy', label: 'A - Easy', description: 'Suitable for beginners, gentle terrain' },
  { value: 'moderate', label: 'B - Moderate', description: 'Some hiking experience required' },
  { value: 'challenging', label: 'C - Challenging', description: 'For experienced hikers, steep sections' },
  { value: 'expert', label: 'D - Expert', description: 'Very demanding, technical skills needed' },
];

export default function Step4DurationDifficulty({ onNext }: Step4DurationDifficultyProps) {
  const form = useFormContext<TourFormData>();

  const handleNext = async () => {
    const isValid = await form.trigger(['duration', 'difficulty']);
    if (isValid) onNext();
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
              <FormLabel>Duration</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1 day">1 Day</SelectItem>
                  <SelectItem value="2 days">2 Days</SelectItem>
                  <SelectItem value="3 days">3 Days</SelectItem>
                  <SelectItem value="4 days">4 Days</SelectItem>
                  <SelectItem value="5 days">5 Days</SelectItem>
                  <SelectItem value="6 days">6 Days</SelectItem>
                  <SelectItem value="7 days">1 Week</SelectItem>
                  <SelectItem value="10 days">10 Days</SelectItem>
                  <SelectItem value="14 days">2 Weeks</SelectItem>
                </SelectContent>
              </Select>
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

        <div className="flex justify-end">
          <Button onClick={handleNext}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
