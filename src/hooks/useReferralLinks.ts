import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReferralLinks = (
  userId: string | undefined,
  userType: 'hiker' | 'guide' | undefined,
  firstName: string | undefined
) => {
  return useQuery({
    queryKey: ['referral-links', userId],
    queryFn: async () => {
      if (!userId || !userType || !firstName) throw new Error('Missing required data');

      const { data, error } = await supabase.functions.invoke('manage-referrals', {
        body: { action: 'generate_links', userId, userType, firstName }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data.links;
    },
    enabled: !!userId && !!userType && !!firstName,
  });
};
