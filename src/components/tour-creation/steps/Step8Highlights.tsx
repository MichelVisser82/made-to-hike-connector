import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { useStandardItems } from '@/hooks/useStandardItems';
import { Checkbox } from '@/components/ui/checkbox';

interface Step8HighlightsProps {
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export default function Step8Highlights({ onSave, isSaving }: Step8HighlightsProps) {
  const form = useFormContext<TourFormData>();
  const [newHighlight, setNewHighlight] = useState('');
  const highlights = form.watch('highlights') || [];

  // Fetch standard highlights
  const { data: standardHighlights = [] } = useStandardItems('step8', 'highlight');

  const handleSave = async () => {
    const isValid = await form.trigger(['highlights']);
    if (isValid) await onSave();
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
      const current = form.getValues('highlights') || [];
      if (current.length < 10) {
        form.setValue('highlights', [...current, newHighlight.trim()]);
        setNewHighlight('');
      }
    }
  };

  const removeHighlight = (highlight: string) => {
    const current = form.getValues('highlights') || [];
    form.setValue('highlights', current.filter((h: string) => h !== highlight));
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
              
              {/* Standard Items */}
              {standardHighlights.length > 0 && (
                <div className="space-y-3 mb-4">
                  <Label className="text-sm font-medium">Standard Highlights</Label>
                  <div className="flex flex-wrap gap-2">
                    {standardHighlights.map((item) => {
                      const isSelected = highlights.includes(item.item_text);
                      const canAdd = highlights.length < 10;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            id={`highlight-${item.id}`}
                            checked={isSelected}
                            disabled={!isSelected && !canAdd}
                            onCheckedChange={(checked) =>
                              toggleStandardHighlight(item.item_text, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`highlight-${item.id}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {item.item_text}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected highlights display */}
              {field.value && field.value.length > 0 && (
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Selected Highlights ({field.value.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((highlight, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 pl-3 pr-2 py-1.5"
                      >
                        <Check className="h-3 w-3" />
                        {highlight}
                        <button
                          type="button"
                          onClick={() => removeHighlight(highlight)}
                          className="ml-1 hover:bg-accent rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add custom highlight */}
              <div className="space-y-2">
                <Label>Add Custom Highlight</Label>
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
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
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
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Progress'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
