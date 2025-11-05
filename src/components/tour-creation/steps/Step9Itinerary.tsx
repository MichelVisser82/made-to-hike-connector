import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';
import { ItineraryImageSelector } from '@/components/tour-creation/ItineraryImageSelector';

interface Step9ItineraryProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

export default function Step9Itinerary({ onSave, onNext, onPrev, isSaving }: Step9ItineraryProps) {
  const form = useFormContext<TourFormData>();
  const [newActivity, setNewActivity] = useState<{ [key: number]: string }>({});

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
        activities: [],
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

  const addActivity = (dayIndex: number) => {
    const activity = newActivity[dayIndex]?.trim();
    if (!activity) return;

    const current = form.getValues('itinerary') || [];
    const updated = [...current];
    updated[dayIndex].activities = [...updated[dayIndex].activities, activity];
    form.setValue('itinerary', updated);
    setNewActivity({ ...newActivity, [dayIndex]: '' });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const current = form.getValues('itinerary') || [];
    const updated = [...current];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== activityIndex);
    form.setValue('itinerary', updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Itinerary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="itinerary"
          render={() => (
            <FormItem>
              <div className="space-y-4">
                {itinerary.map((day, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Day {day.day}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDay(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Day title (e.g., Summit Day)"
                        value={day.title}
                        onChange={(e) => {
                          const updated = [...itinerary];
                          updated[index].title = e.target.value;
                          form.setValue('itinerary', updated);
                        }}
                      />

                      <div>
                        <FormLabel className="text-sm mb-2 block">Day Image</FormLabel>
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

                      <div>
                        <FormLabel className="text-sm">Activities</FormLabel>
                        {day.activities.length > 0 && (
                          <div className="flex flex-wrap gap-2 my-2">
                            {day.activities.map((activity, actIndex) => (
                              <Badge key={actIndex} variant="secondary">
                                {activity}
                                <button
                                  type="button"
                                  onClick={() => removeActivity(index, actIndex)}
                                  className="ml-2 hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add activity"
                            value={newActivity[index] || ''}
                            onChange={(e) => setNewActivity({ ...newActivity, [index]: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addActivity(index);
                              }
                            }}
                          />
                          <Button type="button" size="sm" onClick={() => addActivity(index)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Input
                        placeholder="Accommodation"
                        value={day.accommodation}
                        onChange={(e) => {
                          const updated = [...itinerary];
                          updated[index].accommodation = e.target.value;
                          form.setValue('itinerary', updated);
                        }}
                      />

                      <Input
                        placeholder="Meals included (e.g., Breakfast, Lunch, Dinner)"
                        value={day.meals}
                        onChange={(e) => {
                          const updated = [...itinerary];
                          updated[index].meals = e.target.value;
                          form.setValue('itinerary', updated);
                        }}
                      />
                    </CardContent>
                  </Card>
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
