import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const regionSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  region: z.string().optional(),
  subregion: z.string().min(1, 'Specific hiking area is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  key_features: z.string().min(10, 'Key features are required'),
});

type RegionFormData = z.infer<typeof regionSchema>;

interface AddRegionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCountry: string | null;
  onSuccess: (region: string) => void;
}

export const AddRegionModal = ({
  open,
  onOpenChange,
  preselectedCountry,
  onSuccess,
}: AddRegionModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<RegionFormData>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      country: preselectedCountry || '',
      region: '',
      subregion: '',
      description: '',
      key_features: '',
    },
  });

  const onSubmit = async (data: RegionFormData) => {
    setIsSubmitting(true);
    try {
      // Convert key_features string to array
      const keyFeaturesArray = data.key_features
        .split('|')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const { data: result, error } = await supabase.functions.invoke('submit-region-request', {
        body: {
          country: data.country,
          region: data.region || null,
          subregion: data.subregion,
          description: data.description,
          key_features: keyFeaturesArray,
        },
      });

      if (error) throw error;

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Region submitted! You can use it immediately while it awaits admin review.');
      
      // Invalidate the regions query to fetch the newly submitted region
      await queryClient.invalidateQueries({ queryKey: ['hiking-regions'] });
      
      // Create the display value
      const displayValue = data.region
        ? `${data.country} - ${data.region} - ${data.subregion}`
        : `${data.country} - ${data.subregion}`;
      
      onSuccess(displayValue);
      form.reset();
    } catch (error) {
      console.error('Error submitting region:', error);
      toast.error('Failed to submit region request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Your Hiking Region</DialogTitle>
          <DialogDescription>
            Can't find your region? Submit it for admin verification. We'll check if it exists and add it to our database.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Scotland" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Scottish Highlands" />
                  </FormControl>
                  <FormDescription>
                    Parent region if applicable (leave empty for country-level areas)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subregion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Hiking Area *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Ben Nevis & Glen Coe" />
                  </FormControl>
                  <FormDescription>
                    The specific mountain range, trail system, or hiking area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the hiking area, its characteristics, and what makes it special..."
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 20 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="key_features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Features *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="UK's highest peak (1345m) | Famous Three Sisters | Remote glens | Year-round hiking"
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate features with | (pipe symbol)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Verification
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};