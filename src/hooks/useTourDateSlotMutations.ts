import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TourDateSlotInsert, TourDateSlotUpdate } from '@/types/tourDateSlot';
import { toast } from 'sonner';

export function useTourDateSlotMutations() {
  const queryClient = useQueryClient();

  const createDateSlot = useMutation({
    mutationFn: async (data: TourDateSlotInsert) => {
      const { data: result, error } = await supabase
        .from('tour_date_slots')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tour-date-availability', variables.tour_id] });
      queryClient.invalidateQueries({ queryKey: ['guide-calendar-view'] });
      toast.success('Date slot created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create date slot: ${error.message}`);
    }
  });

  const updateDateSlot = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TourDateSlotUpdate }) => {
      const { data, error } = await supabase
        .from('tour_date_slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-date-availability'] });
      queryClient.invalidateQueries({ queryKey: ['guide-calendar-view'] });
      toast.success('Date slot updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update date slot: ${error.message}`);
    }
  });

  const deleteDateSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tour_date_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-date-availability'] });
      queryClient.invalidateQueries({ queryKey: ['guide-calendar-view'] });
      toast.success('Date slot deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete date slot: ${error.message}`);
    }
  });

  const bulkCreateDateSlots = useMutation({
    mutationFn: async (slots: TourDateSlotInsert[]) => {
      const { data, error } = await supabase
        .from('tour_date_slots')
        .insert(slots)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['tour-date-availability', variables[0].tour_id] });
        queryClient.invalidateQueries({ queryKey: ['guide-calendar-view'] });
      }
      toast.success(`${variables.length} date slots created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create date slots: ${error.message}`);
    }
  });

  return {
    createDateSlot,
    updateDateSlot,
    deleteDateSlot,
    bulkCreateDateSlots
  };
}
