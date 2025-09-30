import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface Step8HighlightsProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step8Highlights({ onNext }: Step8HighlightsProps) {
  const form = useFormContext<TourFormData>();
  const [newHighlight, setNewHighlight] = useState('');

  const handleNext = async () => {
    const isValid = await form.trigger(['highlights']);
    if (isValid) onNext();
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      const current = form.getValues('highlights') || [];
      if (current.length < 10) {
        form.setValue('highlights', [...current, newHighlight.trim()]);
        setNewHighlight('');
      }
    }
  };

  const removeHighlight = (index: number) => {
    const current = form.getValues('highlights') || [];
    form.setValue('highlights', current.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="highlights"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What makes your tour special?</FormLabel>
              
              {/* Display highlights */}
              {field.value && field.value.length > 0 && (
                <div className="space-y-2 mb-4">
                  {field.value.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <span className="flex-1">{highlight}</span>
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new highlight */}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Stunning sunrise views from mountain peaks"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHighlight();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addHighlight}
                  disabled={!newHighlight.trim() || (field.value?.length || 0) >= 10}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{field.value?.length || 0} / 10 highlights</span>
                <span>Add 3-10 highlights</span>
              </div>

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
