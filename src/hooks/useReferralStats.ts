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

      const raw = data.stats;

      // Normalize backend stats into the shape expected by the UI components
      const invitations = raw?.invitations ?? [];
      const signups = raw?.signups ?? [];

      const referrals = invitations.map((inv: any) => ({
        id: inv.id,
        referee_email: inv.referee_email,
        target_type: inv.target_type,
        status: inv.status,
        reward_amount: inv.reward_amount,
        sent_at: inv.sent_at,
        clicked_at: inv.clicked_at,
        expires_at: inv.expires_at,
      }));

      const totalInvites = raw?.total_invitations_sent ?? invitations.length;
      const completedReferrals = raw?.completed_signups ?? 0;

      const totalEarned = signups
        .filter((s: any) => s.reward_status === 'issued')
        .reduce((sum: number, s: any) => sum + (s.reward_amount || 0), 0);

      return {
        ...raw,
        referrals,
        totalInvites,
        completedReferrals,
        totalEarned,
      };
    },
    enabled: !!userId,
  });
};