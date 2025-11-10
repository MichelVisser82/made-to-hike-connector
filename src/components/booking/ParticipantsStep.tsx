import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Minus, Plus, User } from 'lucide-react';

interface ParticipantsStepProps {
  form: UseFormReturn<BookingFormData>;
  onNext: () => void;
  onBack?: () => void;
  minGroupSize: number;
  maxGroupSize: number;
  spotsRemaining: number;
}

export const ParticipantsStep = ({
  form,
  onNext,
  onBack,
  minGroupSize,
  maxGroupSize,
  spotsRemaining
}: ParticipantsStepProps) => {
  const participants = form.watch('participants') || [];
  const [participantCount, setParticipantCount] = useState(participants.length || 1);
  
  console.log('[ParticipantsStep] Rendered with participants:', participants);

  const handleCountChange = (newCount: number) => {
    const current = form.getValues('participants') || [];
    
    if (newCount > current.length) {
      // Add new empty participants
      const toAdd = newCount - current.length;
      const newParticipants = [...current];
      for (let i = 0; i < toAdd; i++) {
        newParticipants.push({
          firstName: '',
          surname: '',
          age: 0,
          experience: 'beginner',
          medicalConditions: ''
        });
      }
      form.setValue('participants', newParticipants);
    } else if (newCount < current.length) {
      // Remove participants
      form.setValue('participants', current.slice(0, newCount));
    }
    
    setParticipantCount(newCount);
  };

  const handleNext = () => {
    const valid = form.trigger('participants');
    if (valid) {
      onNext();
    }
  };

  const actualMax = Math.min(maxGroupSize, spotsRemaining);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Who's coming on this adventure?</h2>
        <p className="text-muted-foreground">
          Tell us about each participant (minimum {minGroupSize}, maximum {actualMax} spots available)
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Label className="text-lg font-semibold">Number of participants</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleCountChange(Math.max(minGroupSize, participantCount - 1))}
              disabled={participantCount <= minGroupSize}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-2xl font-bold w-12 text-center">{participantCount}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleCountChange(Math.min(actualMax, participantCount + 1))}
              disabled={participantCount >= actualMax}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {participants.map((_, index) => (
            <Card key={index} className="p-4 border-2">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">
                  Participant {index + 1} {index === 0 && "(You)"}
                </h3>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`participant-${index}-firstName`}>First Name</Label>
                    <Input
                      id={`participant-${index}-firstName`}
                      {...form.register(`participants.${index}.firstName`)}
                      placeholder="First name"
                    />
                    {form.formState.errors.participants?.[index]?.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.participants[index]?.firstName?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`participant-${index}-surname`}>Surname</Label>
                    <Input
                      id={`participant-${index}-surname`}
                      {...form.register(`participants.${index}.surname`)}
                      placeholder="Surname"
                    />
                    {form.formState.errors.participants?.[index]?.surname && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.participants[index]?.surname?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor={`participant-${index}-age`}>Age</Label>
                  <Input
                    id={`participant-${index}-age`}
                    type="number"
                    {...form.register(`participants.${index}.age`, { valueAsNumber: true })}
                    placeholder="Age"
                  />
                  {form.formState.errors.participants?.[index]?.age && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.participants[index]?.age?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`participant-${index}-experience`}>Hiking Experience</Label>
                  <Select
                    value={form.watch(`participants.${index}.experience`)}
                    onValueChange={(value) => form.setValue(`participants.${index}.experience`, value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`participant-${index}-medical`}>
                    Medical Conditions (Optional)
                  </Label>
                  <Textarea
                    id={`participant-${index}-medical`}
                    {...form.register(`participants.${index}.medicalConditions`)}
                    placeholder="Any medical conditions the guide should know about"
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="flex justify-between">
        {onBack ? (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        ) : <div />}
        <Button onClick={handleNext} size="lg">
          Continue to Contact Info
        </Button>
      </div>
    </div>
  );
};
