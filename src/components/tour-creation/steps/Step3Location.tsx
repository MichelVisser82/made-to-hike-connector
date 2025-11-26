import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { TourFormData } from '@/hooks/useTourCreation';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { InteractiveLocationMap } from '../InteractiveLocationMap';
import { RegionSelector } from '../RegionSelector';
import { Clock } from 'lucide-react';

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

  // Parse region into structured fields when it changes
  useEffect(() => {
    if (selectedRegion) {
      const parts = selectedRegion.split(' - ');
      if (parts.length === 3) {
        form.setValue('region_country', parts[0]);
        form.setValue('region_region', parts[1]);
        form.setValue('region_subregion', parts[2]);
      } else if (parts.length === 2) {
        form.setValue('region_country', parts[0]);
        form.setValue('region_region', null);
        form.setValue('region_subregion', parts[1]);
      }
    }
  }, [selectedRegion, form]);

  const handleSave = async () => {
    const isValid = await form.trigger(['region', 'meeting_point', 'meeting_time']);
    if (isValid && onSave) await onSave();
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['region', 'meeting_point', 'meeting_time']);
    if (isValid && onNext) await onNext();
  };

  return (
    <Card className="border-l-4 border-l-burgundy shadow-elegant">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair text-charcoal">Where is your tour?</CardTitle>
        <p className="text-sm text-charcoal/60 mt-2">Select the region and meeting point for your tour</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-charcoal font-medium">Hiking Region *</FormLabel>
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
              <FormLabel className="text-charcoal font-medium">Meeting Point</FormLabel>
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
              <p className="text-sm text-charcoal/60 mt-2">
                You can search above or drop a pin on the map below
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meeting_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-charcoal font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Meeting Time *
              </FormLabel>
              <FormControl>
                <Input
                  type="time"
                  {...field}
                  value={field.value || '09:00'}
                  className="border-burgundy/20 focus:border-burgundy"
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-charcoal/60 mt-2">
                What time should hikers arrive at the meeting point?
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
