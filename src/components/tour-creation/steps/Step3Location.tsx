import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { MapPin } from 'lucide-react';
import { LocationAutocomplete } from '../LocationAutocomplete';

interface Step3LocationProps {
  onNext: () => void;
  onPrev: () => void;
}

const regions = [
  { value: 'dolomites', label: 'Dolomites, Italy', description: 'Dramatic limestone peaks' },
  { value: 'pyrenees', label: 'Pyrenees', description: 'France-Spain border range' },
  { value: 'scotland', label: 'Scottish Highlands', description: 'Rugged mountain terrain' },
];

export default function Step3Location({ onNext }: Step3LocationProps) {
  const form = useFormContext<TourFormData>();
  
  const meetingPointLat = form.watch('meeting_point_lat');
  const meetingPointLng = form.watch('meeting_point_lng');

  const handleNext = async () => {
    const isValid = await form.trigger(['region', 'meeting_point']);
    if (isValid) onNext();
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
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button onClick={handleNext}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
