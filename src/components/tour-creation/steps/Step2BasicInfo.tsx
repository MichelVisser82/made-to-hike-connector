import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { SlugEditor } from '@/components/tour-creation/SlugEditor';

interface Step2BasicInfoProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
  tourId?: string;
}

export default function Step2BasicInfo({ onSave, onNext, onPrev, isSaving, tourId }: Step2BasicInfoProps) {
  const form = useFormContext<TourFormData>();

  const handleSave = async () => {
    const isValid = await form.trigger(['title', 'slug', 'short_description', 'description']);
    if (isValid && onSave) await onSave();
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['title', 'slug', 'short_description', 'description']);
    if (isValid && onNext) await onNext();
  };

  return (
    <Card className="border-l-4 border-l-burgundy">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair text-charcoal">Tell us about your tour</CardTitle>
        <p className="text-sm text-charcoal/60 mt-2">Create a compelling title and description that captures the essence of your hiking experience</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-charcoal font-medium">Tour Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Alpine Adventure in the Dolomites" 
                  className="border-burgundy/20 focus:border-burgundy"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SlugEditor tourId={tourId} titleFieldName="title" />

        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-charcoal font-medium">Short Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description that will appear over the hero image (max 140 characters)"
                  rows={3}
                  maxLength={140}
                  className="border-burgundy/20 focus:border-burgundy"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-charcoal/50">
                {field.value?.length || 0}/140 characters
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-charcoal font-medium">Full Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your tour in detail. What makes it special? What will hikers experience?"
                  rows={8}
                  className="border-burgundy/20 focus:border-burgundy"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-charcoal/50">
                {field.value?.length || 0}/2000 characters
              </p>
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4 border-t border-burgundy/10">
          {onPrev && (
            <Button type="button" variant="outline" onClick={onPrev} className="border-burgundy/20 text-charcoal hover:bg-cream">
              Previous
            </Button>
          )}
          <div className="flex-1" />
          {onNext ? (
            <Button onClick={handleNext} disabled={isSaving} className="bg-burgundy hover:bg-burgundy-dark text-white">
              {isSaving ? 'Saving...' : 'Next'}
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving} className="bg-burgundy hover:bg-burgundy-dark text-white">
              {isSaving ? 'Saving...' : 'Save Progress'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
