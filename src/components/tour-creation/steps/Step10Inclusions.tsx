import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface Step10InclusionsProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step10Inclusions({ onNext }: Step10InclusionsProps) {
  const form = useFormContext<TourFormData>();
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const handleNext = async () => {
    const isValid = await form.trigger(['includes', 'excluded_items']);
    if (isValid) onNext();
  };

  const addInclusion = () => {
    if (newInclusion.trim()) {
      const current = form.getValues('includes') || [];
      form.setValue('includes', [...current, newInclusion.trim()]);
      setNewInclusion('');
    }
  };

  const removeInclusion = (index: number) => {
    const current = form.getValues('includes') || [];
    form.setValue('includes', current.filter((_, i) => i !== index));
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      const current = form.getValues('excluded_items') || [];
      form.setValue('excluded_items', [...current, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    const current = form.getValues('excluded_items') || [];
    form.setValue('excluded_items', current.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's Included & Excluded</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Inclusions */}
          <FormField
            control={form.control}
            name="includes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Included</FormLabel>
                
                {field.value && field.value.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {field.value.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded bg-green-50 dark:bg-green-950/20">
                        <span className="flex-1 text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeInclusion(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Professional guide"
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInclusion();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addInclusion}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Exclusions */}
          <FormField
            control={form.control}
            name="excluded_items"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excluded</FormLabel>
                
                {field.value && field.value.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {field.value.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded bg-red-50 dark:bg-red-950/20">
                        <span className="flex-1 text-sm">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeExclusion(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Personal equipment"
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addExclusion();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addExclusion}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleNext}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
