import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useStandardItems } from '@/hooks/useStandardItems';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Step10InclusionsProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step10Inclusions({ onNext }: Step10InclusionsProps) {
  const { setValue, watch, trigger } = useFormContext();
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const includes = watch('includes') || [];
  const excludedItems = watch('excluded_items') || [];

  // Fetch standard items
  const { data: standardInclusions = [] } = useStandardItems('step10', 'included');
  const { data: standardExclusions = [] } = useStandardItems('step10', 'excluded');

  const handleNext = async () => {
    const isValid = await trigger(['includes', 'excluded_items']);
    if (isValid) {
      onNext();
    }
  };

  const toggleStandardInclusion = (itemText: string, checked: boolean) => {
    if (checked) {
      setValue('includes', [...includes, itemText]);
    } else {
      setValue('includes', includes.filter((item: string) => item !== itemText));
    }
  };

  const toggleStandardExclusion = (itemText: string, checked: boolean) => {
    if (checked) {
      setValue('excluded_items', [...excludedItems, itemText]);
    } else {
      setValue('excluded_items', excludedItems.filter((item: string) => item !== itemText));
    }
  };

  const addCustomInclusion = () => {
    if (newInclusion.trim()) {
      setValue('includes', [...includes, newInclusion.trim()]);
      setNewInclusion('');
    }
  };

  const removeInclusion = (index: number) => {
    const updated = [...includes];
    updated.splice(index, 1);
    setValue('includes', updated);
  };

  const addCustomExclusion = () => {
    if (newExclusion.trim()) {
      setValue('excluded_items', [...excludedItems, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    const updated = [...excludedItems];
    updated.splice(index, 1);
    setValue('excluded_items', updated);
  };

  return (
    <div className="space-y-6">
      {/* Included Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            What's Included
          </CardTitle>
          <CardDescription>
            Select standard items or add custom ones that are included in your tour
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Standard Items */}
          {standardInclusions.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Standard Items</Label>
              <div className="flex flex-wrap gap-2">
                {standardInclusions.map((item) => {
                  const isSelected = includes.includes(item.item_text);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`include-${item.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleStandardInclusion(item.item_text, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`include-${item.id}`}
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

          {/* Custom Item Input */}
          <div className="space-y-2">
            <Label>Add Custom Item</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Professional photography"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInclusion())}
              />
              <Button type="button" onClick={addCustomInclusion} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Items Display */}
          {includes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Items ({includes.length})</Label>
              <div className="flex flex-wrap gap-2">
                {includes.map((item: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                  >
                    <Check className="h-3 w-3" />
                    {item}
                    <button
                      type="button"
                      onClick={() => removeInclusion(index)}
                      className="ml-1 hover:bg-green-500/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excluded Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />
            What's Not Included
          </CardTitle>
          <CardDescription>
            Select standard items or add custom ones that are NOT included in your tour
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Standard Items */}
          {standardExclusions.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Standard Items</Label>
              <div className="flex flex-wrap gap-2">
                {standardExclusions.map((item) => {
                  const isSelected = excludedItems.includes(item.item_text);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`exclude-${item.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleStandardExclusion(item.item_text, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`exclude-${item.id}`}
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

          {/* Custom Item Input */}
          <div className="space-y-2">
            <Label>Add Custom Item</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Alcoholic beverages"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomExclusion())}
              />
              <Button type="button" onClick={addCustomExclusion} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Items Display */}
          {excludedItems.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Items ({excludedItems.length})</Label>
              <div className="flex flex-wrap gap-2">
                {excludedItems.map((item: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                  >
                    <X className="h-3 w-3" />
                    {item}
                    <button
                      type="button"
                      onClick={() => removeExclusion(index)}
                      className="ml-1 hover:bg-red-500/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
