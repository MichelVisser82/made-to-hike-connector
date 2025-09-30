import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { useStandardItems } from '@/hooks/useStandardItems';
import { Checkbox } from '@/components/ui/checkbox';

interface Step8HighlightsProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step8Highlights({ onNext }: Step8HighlightsProps) {
  const form = useFormContext<TourFormData>();
  const [newHighlight, setNewHighlight] = useState('');
  const highlights = form.watch('highlights') || [];

  // Fetch standard highlights
  const { data: standardHighlights = [] } = useStandardItems('step8', 'highlight');

  const handleNext = async () => {
    const isValid = await form.trigger(['highlights']);
    if (isValid) onNext();
  };

  const toggleStandardHighlight = (itemText: string, checked: boolean) => {
    if (checked) {
      if (highlights.length < 10) {
        form.setValue('highlights', [...highlights, itemText]);
      }
    } else {
      form.setValue('highlights', highlights.filter((item: string) => item !== itemText));
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      if (highlights.length < 10) {
        form.setValue('highlights', [...highlights, newHighlight.trim()]);
        setNewHighlight('');
      }
    }
  };

  const removeHighlight = (index: number) => {
    form.setValue('highlights', highlights.filter((_: string, i: number) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Highlights</CardTitle>
        <CardDescription>
          Select standard highlights or add custom ones that make your tour special
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Standard Highlights */}
        {standardHighlights.length > 0 && (
          <div className="space-y-3">
            <FormLabel className="text-sm font-medium">Standard Highlights</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {standardHighlights.map((item) => {
                const isSelected = highlights.includes(item.item_text);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`highlight-${item.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        toggleStandardHighlight(item.item_text, checked as boolean)
                      }
                      disabled={!isSelected && highlights.length >= 10}
                    />
                    <FormLabel
                      htmlFor={`highlight-${item.id}`}
                      className="cursor-pointer text-sm font-normal flex-1"
                    >
                      {item.item_text}
                    </FormLabel>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Highlight Input */}
        <div className="space-y-2">
          <FormLabel>Add Custom Highlight</FormLabel>
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
              size="icon"
              variant="outline"
              disabled={!newHighlight.trim() || highlights.length >= 10}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Selected Highlights Display */}
        {highlights.length > 0 && (
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium">Selected Highlights ({highlights.length}/10)</FormLabel>
            <div className="flex flex-wrap gap-2">
              {highlights.map((highlight: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-primary/10 text-primary border-primary/20"
                >
                  <Check className="h-3 w-3" />
                  {highlight}
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleNext}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
