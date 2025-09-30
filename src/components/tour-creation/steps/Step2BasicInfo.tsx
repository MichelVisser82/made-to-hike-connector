import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';

interface Step2BasicInfoProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2BasicInfo({ onNext }: Step2BasicInfoProps) {
  const form = useFormContext<TourFormData>();

  const handleNext = async () => {
    const isValid = await form.trigger(['title', 'description']);
    if (isValid) onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell us about your tour</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tour Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Alpine Adventure in the Dolomites" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your tour in detail. What makes it special? What will hikers experience?"
                  rows={8}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                {field.value.length}/2000 characters
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
