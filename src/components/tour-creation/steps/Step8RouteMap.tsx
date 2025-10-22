import { Button } from '@/components/ui/button';
import { MapEditorInterface } from '../map/MapEditorInterface';
import { useFormContext } from 'react-hook-form';

interface Step8RouteMapProps {
  onNext: () => void;
  onPrev: () => void;
  tourId?: string;
}

export function Step8RouteMap({ onNext, onPrev, tourId }: Step8RouteMapProps) {
  const { setValue, watch } = useFormContext();
  const duration = watch('duration') || '1 day';
  
  // Parse days from duration string (e.g., "3 days" -> 3)
  const daysCount = parseInt(duration.match(/\d+/)?.[0] || '1');

  const handleDataChange = (data: any) => {
    setValue('routeData', data);
  };

  const handleSkip = () => {
    setValue('routeData', null);
    onNext();
  };

  return (
    <div className="space-y-6">
      {tourId && (
        <MapEditorInterface
          tourId={tourId}
          daysCount={daysCount}
          onDataChange={handleDataChange}
        />
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
