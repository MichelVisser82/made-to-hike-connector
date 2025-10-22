import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { X, Percent, Calendar as CalendarIcon, Users } from 'lucide-react';
import type { DateSlotFormData } from '@/types/tourDateSlot';

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

  const dateSlots = form.watch('date_slots') || [];
  const basePrice = form.watch('price') || 0;
  const baseCurrency = form.watch('currency') || 'EUR';
  const baseGroupSize = form.watch('group_size') || 1;

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
        priceOverride: basePrice,
        currencyOverride: baseCurrency
      };
      form.setValue('date_slots', [...dateSlots, newSlot]);
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
    <Card>
      <CardHeader>
        <CardTitle>Configure Available Dates</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select dates and customize pricing, capacity, and discounts for each slot
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
                disabled={(date) => date < new Date()}
                className="rounded-md border"
                modifiers={{
                  booked: dateSlots.map(slot => slot.date)
                }}
                modifiersStyles={{
                  booked: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Click dates to add/configure them
            </p>
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
                    <FormLabel className="text-xs">Price Override ({baseCurrency})</FormLabel>
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

                  <div>
                    <FormLabel className="text-xs">Discount %</FormLabel>
                    <div className="flex items-center gap-2 mt-1">
                      <Percent className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={currentSlot.discountPercentage || ''}
                        onChange={(e) => handleUpdateSlot(editingSlotIndex, { 
                          discountPercentage: parseInt(e.target.value) || undefined 
                        })}
                        className="w-24"
                      />
                    </div>
                  </div>

                  {currentSlot.discountPercentage && (
                    <div>
                      <FormLabel className="text-xs">Discount Label</FormLabel>
                      <Input
                        value={currentSlot.discountLabel || ''}
                        onChange={(e) => handleUpdateSlot(editingSlotIndex, { 
                          discountLabel: e.target.value 
                        })}
                        placeholder="e.g., Early Bird Special"
                      />
                    </div>
                  )}
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
                  {slot.discountPercentage && ` (-${slot.discountPercentage}%)`}
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
