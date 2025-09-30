import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StandardItem } from './useStandardItems';

export function useTemplateManagement(stepName?: string) {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['template-management', stepName],
    queryFn: async () => {
      let query = supabase
        .from('tour_step_templates')
        .select('*')
        .order('sort_order', { ascending: true });

      if (stepName) {
        query = query.eq('step_name', stepName);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StandardItem[];
    },
    enabled: !!stepName,
  });

  const createItem = useMutation({
    mutationFn: async (newItem: Omit<StandardItem, 'id'>) => {
      const { data, error } = await supabase
        .from('tour_step_templates')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-management'] });
      queryClient.invalidateQueries({ queryKey: ['standard-items'] });
      toast({
        title: 'Success',
        description: 'Standard item added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StandardItem> }) => {
      const { data, error } = await supabase
        .from('tour_step_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-management'] });
      queryClient.invalidateQueries({ queryKey: ['standard-items'] });
      toast({
        title: 'Success',
        description: 'Standard item updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tour_step_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-management'] });
      queryClient.invalidateQueries({ queryKey: ['standard-items'] });
      toast({
        title: 'Success',
        description: 'Standard item deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const reorderItems = useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      const promises = items.map(({ id, sort_order }) =>
        supabase
          .from('tour_step_templates')
          .update({ sort_order })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw new Error('Failed to reorder items');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-management'] });
      queryClient.invalidateQueries({ queryKey: ['standard-items'] });
      toast({
        title: 'Success',
        description: 'Items reordered successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    templates,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
}
