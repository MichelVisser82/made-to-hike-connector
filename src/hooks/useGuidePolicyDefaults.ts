import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GuidePolicyDefaults } from '@/types/policySettings';
import { toast } from 'sonner';

export function useGuidePolicyDefaults(guideId: string | null) {
  const queryClient = useQueryClient();

  const { data: defaults, isLoading } = useQuery({
    queryKey: ['guide-policy-defaults', guideId],
    queryFn: async () => {
      if (!guideId) return null;

      const { data, error } = await supabase
        .from('guide_profiles')
        .select(`
          cancellation_approach,
          cancellation_policy_type,
          early_bird_settings,
          group_discount_settings,
          last_minute_settings,
          deposit_type,
          deposit_amount,
          final_payment_days
        `)
        .eq('user_id', guideId)
        .single();

      if (error) throw error;
      return {
        cancellation_approach: data.cancellation_approach,
        cancellation_policy_type: data.cancellation_policy_type,
        early_bird_settings: data.early_bird_settings as unknown as GuidePolicyDefaults['early_bird_settings'],
        group_discount_settings: data.group_discount_settings as unknown as GuidePolicyDefaults['group_discount_settings'],
        last_minute_settings: data.last_minute_settings as unknown as GuidePolicyDefaults['last_minute_settings'],
        deposit_type: data.deposit_type,
        deposit_amount: data.deposit_amount,
        final_payment_days: data.final_payment_days,
      } as GuidePolicyDefaults;
    },
    enabled: !!guideId,
  });

  const updateDefaults = useMutation({
    mutationFn: async (updates: Partial<GuidePolicyDefaults>) => {
      if (!guideId) throw new Error('No guide ID provided');

      // Convert typed objects to JSON for database
      const dbUpdates: Record<string, any> = {};
      if (updates.cancellation_approach) dbUpdates.cancellation_approach = updates.cancellation_approach;
      if (updates.cancellation_policy_type) dbUpdates.cancellation_policy_type = updates.cancellation_policy_type;
      if (updates.early_bird_settings) dbUpdates.early_bird_settings = updates.early_bird_settings;
      if (updates.group_discount_settings) dbUpdates.group_discount_settings = updates.group_discount_settings;
      if (updates.last_minute_settings) dbUpdates.last_minute_settings = updates.last_minute_settings;
      if (updates.deposit_type) dbUpdates.deposit_type = updates.deposit_type;
      if (updates.deposit_amount !== undefined) dbUpdates.deposit_amount = updates.deposit_amount;
      if (updates.final_payment_days !== undefined) dbUpdates.final_payment_days = updates.final_payment_days;

      const { error } = await supabase
        .from('guide_profiles')
        .update(dbUpdates)
        .eq('user_id', guideId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-policy-defaults', guideId] });
      toast.success('Default settings updated successfully');
    },
    onError: (error) => {
      console.error('Error updating defaults:', error);
      toast.error('Failed to update default settings');
    },
  });

  return {
    defaults,
    isLoading,
    updateDefaults: updateDefaults.mutate,
    isUpdating: updateDefaults.isPending,
  };
}
