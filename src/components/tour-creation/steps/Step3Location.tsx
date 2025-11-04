import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { InteractiveLocationMap } from '../InteractiveLocationMap';
import { RegionSelector } from '../RegionSelector';

interface Step3LocationProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

export default function Step3Location({ onSave, onNext, onPrev, isSaving }: Step3LocationProps) {
  const form = useFormContext<TourFormData>();
  
  const meetingPoint = form.watch('meeting_point');
  const meetingPointLat = form.watch('meeting_point_lat');
  const meetingPointLng = form.watch('meeting_point_lng');
  const selectedRegion = form.watch('region');

  const handleSave = async () => {
    const isValid = await form.trigger(['region', 'meeting_point']);
    if (isValid && onSave) await onSave();
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['region', 'meeting_point']);
    if (isValid && onNext) await onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where is your tour?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hiking Region *</FormLabel>
              <FormControl>
                <RegionSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meeting_point"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Point</FormLabel>
              <FormControl>
                <LocationAutocomplete
                  value={meetingPoint || ''}
                  coordinates={{
                    lat: meetingPointLat || 0,
                    lng: meetingPointLng || 0
                  }}
                  onLocationSelect={(data) => {
                    field.onChange(data.address);
                    form.setValue('meeting_point_lat', data.lat);
                    form.setValue('meeting_point_lng', data.lng);
                    form.setValue('meeting_point_formatted', data.formatted);
                  }}
                  placeholder="Search for meeting point location..."
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground mt-2">
                You can search above or drop a pin on the map below
              </p>
            </FormItem>
          )}
        />

        <div className="pt-4">
          <InteractiveLocationMap
            coordinates={typeof meetingPointLat === 'number' && typeof meetingPointLng === 'number' ? {
              lat: meetingPointLat,
              lng: meetingPointLng
            } : undefined}
            onLocationSelect={(data) => {
              form.setValue('meeting_point', data.address);
              form.setValue('meeting_point_lat', data.lat);
              form.setValue('meeting_point_lng', data.lng);
              form.setValue('meeting_point_formatted', data.formatted);
            }}
          />
        </div>

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
