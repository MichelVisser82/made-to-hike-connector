import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Step6AvailableDatesProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step6AvailableDates({ onNext }: Step6AvailableDatesProps) {
  const form = useFormContext<TourFormData>();

  const handleNext = async () => {
    const isValid = await form.trigger(['available_dates']);
    if (isValid) onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="available_dates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select available tour dates</FormLabel>
              
              {/* Selected dates */}
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {field.value.map((date, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {format(date, 'PPP')}
                      <button
                        type="button"
                        onClick={() => {
                          const newDates = field.value.filter((_, i) => i !== index);
                          field.onChange(newDates);
                        }}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Calendar */}
              <div className="flex justify-center">
                <Calendar
                  mode="multiple"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border pointer-events-auto"
                />
              </div>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                Click on dates to add or remove them from your tour schedule
              </p>
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
