import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { Plus, Trash2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ItineraryImageSelector } from '@/components/tour-creation/ItineraryImageSelector';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Step9ItineraryProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

export default function Step9Itinerary({ onSave, onNext, onPrev, isSaving }: Step9ItineraryProps) {
  const form = useFormContext<TourFormData>();

  const itinerary = form.watch('itinerary') || [];

  const handleSave = async () => {
    const isValid = await form.trigger(['itinerary']);
    if (isValid && onSave) await onSave();
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['itinerary']);
    if (isValid && onNext) await onNext();
  };

  const addDay = () => {
    const current = form.getValues('itinerary') || [];
    form.setValue('itinerary', [
      ...current,
      {
        day: current.length + 1,
        title: '',
        description: '',
        accommodation: '',
        meals: '',
        image_url: ''
      }
    ]);
  };

  const removeDay = (index: number) => {
    const current = form.getValues('itinerary') || [];
    form.setValue('itinerary', current.filter((_, i) => i !== index));
  };


  return (
    <Card className="border-l-4 border-l-burgundy shadow-elegant">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair text-charcoal">Daily Itinerary</CardTitle>
        <p className="text-sm text-charcoal/60 mt-2">Plan out each day of your tour</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="itinerary"
          render={() => (
            <FormItem>
              <div className="space-y-6">
                {itinerary.map((day, index) => (
                  <div key={index} className="group relative border border-burgundy/20 rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
                    {/* Delete button - positioned absolutely */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDay(index)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    {/* Horizontal Layout matching public page */}
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Left: Image Section */}
                      <div className="md:w-64 w-full flex-shrink-0">
                        <ItineraryImageSelector
                          selectedImageUrl={day.image_url}
                          existingTourImages={form.watch('images') || []}
                          onImageSelect={(url) => {
                            const updated = [...itinerary];
                            updated[index].image_url = url;
                            form.setValue('itinerary', updated);
                          }}
                          dayNumber={day.day}
                        />
                      </div>

                      {/* Right: Content Section */}
                      <div className="flex-1 space-y-3">
                        {/* Day badge and title */}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Day {day.day}</Badge>
                          <Input
                            placeholder="Day title (e.g., Summit Day)"
                            value={day.title}
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[index].title = e.target.value;
                              form.setValue('itinerary', updated);
                            }}
                            className="font-semibold flex-1"
                          />
                        </div>

                        {/* Day Description */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <FormLabel className="text-sm">Day Description</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm">
                                    Paint a vivid picture of the day! Describe the terrain, the views hikers will experience, 
                                    any challenging sections, rest stops, and what makes this day special. Help them feel the adventure!
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Textarea
                            placeholder="e.g., Today we tackle the breathtaking ascent to the summit. Starting at dawn, we'll navigate through ancient pine forests as the morning mist clears. The trail gradually steepens with stunning panoramic views opening up at every turn. We'll pause at Eagle's Nest viewpoint for snacks and photos before the final push. The reward at the top? 360-degree views of snow-capped peaks stretching to the horizon..."
                            value={day.description}
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[index].description = e.target.value;
                              form.setValue('itinerary', updated);
                            }}
                            rows={5}
                            className="resize-none"
                          />
                        </div>

                        {/* Accommodation */}
                        <div>
                          <FormLabel className="text-sm">Accommodation</FormLabel>
                          <Input
                            placeholder="e.g., Mountain Refuge Hut"
                            value={day.accommodation}
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[index].accommodation = e.target.value;
                              form.setValue('itinerary', updated);
                            }}
                          />
                        </div>

                        {/* Meals */}
                        <div>
                          <FormLabel className="text-sm">Meals</FormLabel>
                          <Input
                            placeholder="e.g., Breakfast, Lunch, Dinner"
                            value={day.meals}
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[index].meals = e.target.value;
                              form.setValue('itinerary', updated);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addDay} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Day
                </Button>
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
