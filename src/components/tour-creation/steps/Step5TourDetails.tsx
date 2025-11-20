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
    const isValid = await form.trigger(['pack_weight', 'daily_hours', 'terrain_types', 'total_distance_km', 'average_distance_per_day_km', 'elevation_gain_m']);
    if (isValid && onSave) await onSave();
  };

  const handleNext = async () => {
    const isValid = await form.trigger(['pack_weight', 'daily_hours', 'terrain_types', 'total_distance_km', 'average_distance_per_day_km', 'elevation_gain_m']);
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
    <Card className="border-l-4 border-l-burgundy shadow-elegant">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair text-charcoal">Tour Details</CardTitle>
        <p className="text-sm text-charcoal/60 mt-2">Provide specific information about your tour</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pack_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-charcoal font-medium">Pack Weight (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    max="50"
                    className="border-burgundy/20 focus:border-burgundy"
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
            name="elevation_gain_m"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-charcoal font-medium">Elevation Gain (m) (average per day)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="e.g., 850"
                    className="border-burgundy/20 focus:border-burgundy"
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="daily_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-charcoal font-medium">Daily Hours</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., 6-8 hours" 
                  className="border-burgundy/20 focus:border-burgundy"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="total_distance_km"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-charcoal font-medium">Total Distance (km)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    min="0"
                    placeholder="e.g., 45"
                    className="border-burgundy/20 focus:border-burgundy"
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="average_distance_per_day_km"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-charcoal font-medium">Avg. Distance Per Day (km)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    min="0"
                    placeholder="e.g., 15"
                    className="border-burgundy/20 focus:border-burgundy"
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
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
              <FormLabel className="text-charcoal font-medium">Terrain Types</FormLabel>
              <div className="space-y-3">
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((terrain) => (
                      <Badge key={terrain} variant="secondary" className="gap-1">
                        {terrain}
                        <button
                          type="button"
                          onClick={() => removeTerrain(terrain)}
                          className="ml-1 hover:text-burgundy"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {commonTerrainTypes.map((terrain) => (
                    <Button
                      key={terrain}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTerrain(terrain)}
                      disabled={field.value?.includes(terrain)}
                      className="border-burgundy/20 text-charcoal hover:bg-cream"
                    >
                      {terrain}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom terrain type..."
                    value={customTerrain}
                    onChange={(e) => setCustomTerrain(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTerrain())}
                    className="border-burgundy/20 focus:border-burgundy"
                  />
                  <Button 
                    type="button" 
                    onClick={addCustomTerrain}
                    variant="outline"
                    className="border-burgundy/20"
                  >
                    Add
                  </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

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
