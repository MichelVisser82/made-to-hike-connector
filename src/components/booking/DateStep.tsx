import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '@/types/booking';
import { useTourDateAvailability } from '@/hooks/useTourDateAvailability';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface DateStepProps {
  form: UseFormReturn<BookingFormData>;
  tourId: string;
  onNext: (slotId: string) => void;
  onBack?: () => void;
  participantCount: number;
  preselectedSlotId?: string;
}

export const DateStep = ({ form, tourId, onNext, onBack, participantCount, preselectedSlotId }: DateStepProps) => {
  const { data: availableDates, isLoading } = useTourDateAvailability(tourId);
  const selectedSlotId = form.watch('selectedDateSlotId') || preselectedSlotId;
  
  // If there's a preselected slot, set it in the form
  useEffect(() => {
    if (preselectedSlotId && !form.getValues('selectedDateSlotId')) {
      form.setValue('selectedDateSlotId', preselectedSlotId);
    }
  }, [preselectedSlotId, form]);

  const handleSelectDate = (slotId: string) => {
    form.setValue('selectedDateSlotId', slotId);
  };

  const handleNext = () => {
    if (selectedSlotId) {
      onNext(selectedSlotId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  const validDates = availableDates?.filter(
    (slot) => slot.spotsRemaining >= participantCount
  ) || [];

  const selectedSlotData = availableDates?.find(slot => slot.slotId === selectedSlotId);
  const isConfirmationMode = preselectedSlotId && selectedSlotData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {isConfirmationMode ? 'Confirm Your Date' : 'Select Your Date'}
        </h2>
        <p className="text-muted-foreground">
          {isConfirmationMode 
            ? 'Please confirm your selected date before continuing'
            : `Choose from available dates with ${participantCount} spot${participantCount > 1 ? 's' : ''} available`
          }
        </p>
      </div>

      {validDates.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Available Dates</h3>
          <p className="text-muted-foreground mb-4">
            Unfortunately, there are no dates with {participantCount} spots available.
            Try reducing the number of participants or contact the guide.
          </p>
          <Button variant="outline" onClick={onBack}>
            Change Participants
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {validDates.map((slot) => {
            const isSelected = selectedSlotId === slot.slotId;
            const isLimited = slot.spotsRemaining < 5;

            return (
              <Card
                key={slot.slotId}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'border-primary border-2 bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => handleSelectDate(slot.slotId)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        {format(new Date(slot.slotDate), 'EEEE, MMMM d, yyyy')}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{slot.spotsRemaining} spots left</span>
                      </div>
                    </div>

                    {isLimited && (
                      <Badge variant="destructive" className="mt-2">
                        Limited Spots
                      </Badge>
                    )}

                    {slot.discountPercentage && slot.discountPercentage > 0 && (
                      <Badge variant="secondary" className="mt-2 ml-2">
                        {slot.discountLabel || `${slot.discountPercentage}% Off`}
                      </Badge>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {slot.currency === 'EUR' ? '€' : slot.currency === 'GBP' ? '£' : '$'}
                      {slot.price.toFixed(0)}
                    </div>
                    {slot.discountPercentage && slot.discountPercentage > 0 && (
                      <div className="text-sm text-muted-foreground line-through">
                        {slot.currency === 'EUR' ? '€' : slot.currency === 'GBP' ? '£' : '$'}
                        {(slot.price / (1 - slot.discountPercentage / 100)).toFixed(0)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">per person</div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="default">✓ Selected</Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        {!onBack && <div />}
        <Button onClick={handleNext} disabled={!selectedSlotId} size="lg">
          {isConfirmationMode ? 'Confirm & Continue' : 'Continue to Participants'}
        </Button>
      </div>
    </div>
  );
};
