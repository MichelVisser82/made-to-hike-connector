import { CheckCircle } from 'lucide-react';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function BookingProgress({ currentStep, totalSteps }: BookingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          Booking step {currentStep}/{totalSteps}
        </p>
        <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-burgundy h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
