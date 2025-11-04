import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { MapPin } from 'lucide-react';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { InteractiveLocationMap } from '../InteractiveLocationMap';

interface Step3LocationProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

const regions = [
  { value: 'dolomites', label: 'Dolomites, Italy', description: 'Dramatic limestone peaks' },
  { value: 'pyrenees', label: 'Pyrenees', description: 'France-Spain border range' },
  { value: 'scotland', label: 'Scottish Highlands', description: 'Rugged mountain terrain' },
];

export default function Step3Location({ onSave, onNext, onPrev, isSaving }: Step3LocationProps) {
  const form = useFormContext<TourFormData>();
  
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
              <FormLabel>Region</FormLabel>
              <div className="grid grid-cols-1 gap-3">
                {regions.map((region) => (
                  <button
                    key={region.value}
                    type="button"
                    onClick={() => field.onChange(region.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      field.value === region.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                      <div>
                        <div className="font-medium">{region.label}</div>
                        <div className="text-sm text-muted-foreground">{region.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
                  value={field.value}
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
            coordinates={meetingPointLat && meetingPointLng ? {
              lat: meetingPointLat,
              lng: meetingPointLng
            } : undefined}
            onLocationSelect={(data) => {
              form.setValue('meeting_point', data.address);
              form.setValue('meeting_point_lat', data.lat);
              form.setValue('meeting_point_lng', data.lng);
              form.setValue('meeting_point_formatted', data.formatted);
            }}
            regionHint={selectedRegion}
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
