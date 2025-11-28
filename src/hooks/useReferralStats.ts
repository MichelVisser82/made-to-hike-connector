import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReferralStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['referral-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase.functions.invoke('manage-referrals', {
        body: { action: 'get_stats', userId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data.stats;
    },
    enabled: !!userId,
  });
};
