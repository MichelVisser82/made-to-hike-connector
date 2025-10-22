import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Step5TourDetailsProps {
  onSave?: () => Promise<void>;
  onNext?: () => Promise<void>;
  onPrev?: () => void;
  isSaving: boolean;
}

const commonTerrainTypes = [
  'Rocky trails', 'Forest paths', 'Alpine meadows', 'Glacier crossings',
  'Scree slopes', 'Ridge walks', 'Valley floors', 'Mountain passes'
];

export default function Step5TourDetails({ onSave, onNext, onPrev, isSaving }: Step5TourDetailsProps) {
  const form = useFormContext<TourFormData>();
  const [customTerrain, setCustomTerrain] = useState('');

  const handleSave = async () => {
    const isValid = await form.trigger(['pack_weight', 'daily_hours', 'terrain_types', 'distance_km', 'elevation_gain_m']);
    if (isValid && onSave) await onSave();
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['pack_weight', 'daily_hours', 'terrain_types', 'distance_km', 'elevation_gain_m']);
    if (isValid && onNext) await onNext();
  };

  const addTerrain = (terrain: string) => {
    const current = form.getValues('terrain_types') || [];
    if (!current.includes(terrain)) {
      form.setValue('terrain_types', [...current, terrain]);
    }
  };

  const removeTerrain = (terrain: string) => {
    const current = form.getValues('terrain_types') || [];
    form.setValue('terrain_types', current.filter(t => t !== terrain));
  };

  const addCustomTerrain = () => {
    if (customTerrain.trim()) {
      addTerrain(customTerrain.trim());
      setCustomTerrain('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pack_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pack Weight (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    max="50"
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="daily_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Hours</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 6-8 hours" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="distance_km"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance (km)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0.1"
                    step="0.1"
                    placeholder="e.g., 12.5"
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="elevation_gain_m"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Elevation Gain (m)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="e.g., 850"
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="terrain_types"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terrain Types</FormLabel>
              <div className="space-y-3">
                {/* Selected terrain */}
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((terrain) => (
                      <Badge key={terrain} variant="secondary" className="px-3 py-1">
                        {terrain}
                        <button
                          type="button"
                          onClick={() => removeTerrain(terrain)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Common options */}
                <div className="flex flex-wrap gap-2">
                  {commonTerrainTypes.map((terrain) => (
                    <Button
                      key={terrain}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTerrain(terrain)}
                      disabled={field.value?.includes(terrain)}
                    >
                      {terrain}
                    </Button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom terrain type"
                    value={customTerrain}
                    onChange={(e) => setCustomTerrain(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTerrain())}
                  />
                  <Button type="button" onClick={addCustomTerrain}>Add</Button>
                </div>
              </div>
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
