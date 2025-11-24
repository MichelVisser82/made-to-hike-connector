import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { format, addDays, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { X, Calendar as CalendarIcon, Users } from 'lucide-react';
import type { DateSlotFormData } from '@/types/tourDateSlot';
import { supabase } from '@/integrations/supabase/client';
import { useGuideCalendarView } from '@/hooks/useGuideCalendarView';

interface Step6AvailableDatesProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

export default function Step6AvailableDates({ onSave, onNext, onPrev, isSaving }: Step6AvailableDatesProps) {
  const form = useFormContext<TourFormData>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [guideId, setGuideId] = useState<string | undefined>();

  const dateSlots = form.watch('date_slots') || [];
  const basePrice = form.watch('price') || 0;
  const baseCurrency = form.watch('currency') || 'EUR';
  const baseGroupSize = form.watch('group_size') || 1;
  const tourDuration = form.watch('duration') || 1; // Duration in days
  
  // Fetch current guide ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setGuideId(user?.id);
    };
    getUser();
  }, []);

  // Fetch existing calendar data for the guide
  const { data: existingCalendar, isLoading: calendarLoading } = useGuideCalendarView({
    guideId,
    startDate: new Date(),
    endDate: addDays(new Date(), 365)
  });

  // Calculate all dates for current tour slots (including full duration)
  const getCurrentTourDates = () => {
    const allDates: Date[] = [];
    dateSlots.forEach(slot => {
      // Add all days for this tour (start date + duration)
      for (let i = 0; i < Math.ceil(tourDuration); i++) {
        allDates.push(addDays(slot.date, i));
      }
    });
    return allDates;
  };

  const currentTourDates = getCurrentTourDates();

  // Process existing calendar data
  const getExistingTourDates = () => {
    if (!existingCalendar) return { existingBooked: [], existingAvailable: [] };
    
    const existingBooked: Date[] = [];
    const existingAvailable: Date[] = [];
    
    existingCalendar.forEach(slot => {
      const startDate = slot.date;
      // Add all dates in the tour duration
      for (let i = 0; i < slot.durationDays; i++) {
        const date = addDays(startDate, i);
        if (slot.spotsBooked > 0) {
          existingBooked.push(date);
        } else {
          existingAvailable.push(date);
        }
      }
    });
    
    return { existingBooked, existingAvailable };
  };

  const { existingBooked, existingAvailable } = getExistingTourDates();

  // Check if a date is blocked - prevents overlap by checking if ANY day of the new tour would conflict
  const isDateBlocked = (date: Date) => {
    const isInCurrentTour = currentTourDates.some(tourDate => 
      isSameDay(tourDate, date)
    );
    const isInExistingTour = [...existingBooked, ...existingAvailable].some(existingDate =>
      isSameDay(existingDate, date)
    );
    
    // Check if selecting this date would cause the tour duration to overlap with current tour dates
    const wouldOverlapWithCurrentTour = () => {
      for (let i = 0; i < Math.ceil(tourDuration); i++) {
        const checkDate = addDays(date, i);
        const overlaps = currentTourDates.some(tourDate =>
          isSameDay(tourDate, checkDate)
        );
        if (overlaps) return true;
      }
      return false;
    };
    
    // Check if selecting this date would cause the tour duration to overlap with any existing tours
    const wouldOverlapWithExisting = () => {
      for (let i = 0; i < Math.ceil(tourDuration); i++) {
        const checkDate = addDays(date, i);
        const overlaps = [...existingBooked, ...existingAvailable].some(existingDate =>
          isSameDay(existingDate, checkDate)
        );
        if (overlaps) return true;
      }
      return false;
    };
    
    return isInCurrentTour || isInExistingTour || wouldOverlapWithCurrentTour() || wouldOverlapWithExisting();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const existingSlotIndex = dateSlots.findIndex(
      slot => format(slot.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (existingSlotIndex >= 0) {
      setEditingSlotIndex(existingSlotIndex);
    } else {
      const newSlot: DateSlotFormData = {
        date,
        spotsTotal: baseGroupSize,
        // Don't set priceOverride - let it remain undefined to use tour base price
      };
      const updatedSlots = [...dateSlots, newSlot];
      form.setValue('date_slots', updatedSlots);
      // Automatically open the configurator for the newly added slot
      setEditingSlotIndex(updatedSlots.length - 1);
    }
    setSelectedDate(date);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = dateSlots.filter((_, i) => i !== index);
    form.setValue('date_slots', newSlots);
    if (editingSlotIndex === index) {
      setEditingSlotIndex(null);
      setSelectedDate(undefined);
    }
  };

  const handleUpdateSlot = (index: number, updates: Partial<DateSlotFormData>) => {
    const newSlots = [...dateSlots];
    newSlots[index] = { ...newSlots[index], ...updates };
    form.setValue('date_slots', newSlots);
  };

  const currentSlot = editingSlotIndex !== null ? dateSlots[editingSlotIndex] : null;

  const handleSave = async () => {
    const isValid = await form.trigger(['date_slots']);
    if (isValid && dateSlots.length > 0 && onSave) {
      await onSave();
    } else if (dateSlots.length === 0) {
      form.setError('date_slots', { message: 'Please add at least one available date' });
    }
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['date_slots']);
    if (isValid && dateSlots.length > 0 && onNext) {
      await onNext();
    } else if (dateSlots.length === 0) {
      form.setError('date_slots', { message: 'Please add at least one available date' });
    }
  };

  return (
    <Card className="border-l-4 border-l-burgundy shadow-elegant">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair text-charcoal">Configure Available Dates</CardTitle>
        <p className="text-sm text-charcoal/60">
          Select dates and customize pricing and capacity for each slot
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar Selection */}
          <div>
            <FormLabel>Select Dates</FormLabel>
            <div className="mt-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || isDateBlocked(date)}
                className="rounded-md border"
                modifiers={{
                  currentTour: currentTourDates,
                  existingBooked: existingBooked,
                  existingAvailable: existingAvailable
                }}
                modifiersStyles={{
                  currentTour: { backgroundColor: 'hsl(var(--primary))', color: 'white', fontWeight: '600' },
                  existingBooked: { backgroundColor: 'hsl(var(--gold) / 0.4)', color: 'hsl(var(--charcoal))', fontWeight: '600' },
                  existingAvailable: { backgroundColor: 'hsl(var(--sage) / 0.3)', color: 'hsl(var(--charcoal))' }
                }}
              />
            </div>
            <div className="space-y-2 mt-3">
              <p className="text-sm text-charcoal/60">
                Click dates to add start dates. All {Math.ceil(tourDuration)} day{Math.ceil(tourDuration) !== 1 ? 's' : ''} of the tour will be automatically highlighted and blocked.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-charcoal/70 bg-cream/30 p-3 rounded-md border border-burgundy/10">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
                  <span>New tour ({Math.ceil(tourDuration)} day{Math.ceil(tourDuration) !== 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--gold) / 0.4)' }}></div>
                  <span>Existing (booked)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--sage) / 0.3)' }}></div>
                  <span>Existing (available)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Slot Configuration */}
          <div className="space-y-4">
            <FormLabel>Date Configuration</FormLabel>
            
            {currentSlot && editingSlotIndex !== null ? (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="font-medium">{format(currentSlot.date, 'PPP')}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSlot(editingSlotIndex)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <FormLabel className="text-xs">Spots Available</FormLabel>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="1"
                        value={currentSlot.spotsTotal}
                        onChange={(e) => handleUpdateSlot(editingSlotIndex, { 
                          spotsTotal: parseInt(e.target.value) || 1 
                        })}
                        className="w-24"
                      />
                    </div>
                  </div>

                  <div>
                    <FormLabel className="text-xs">Base Price</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentSlot.priceOverride || ''}
                      onChange={(e) => handleUpdateSlot(editingSlotIndex, { 
                        priceOverride: parseFloat(e.target.value) || undefined 
                      })}
                      placeholder={`Base: ${basePrice}`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a date to configure</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Dates Summary */}
        {dateSlots.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Configured Dates ({dateSlots.length})</FormLabel>
            <div className="flex flex-wrap gap-2">
              {dateSlots.map((slot, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-1 cursor-pointer hover:bg-primary/20"
                  onClick={() => {
                    setEditingSlotIndex(index);
                    setSelectedDate(slot.date);
                  }}
                >
                  {format(slot.date, 'MMM d')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="date_slots"
          render={() => (
            <FormItem>
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
