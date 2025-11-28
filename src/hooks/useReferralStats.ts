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

      // Create a map of signups by email for quick lookup
      const signupMap = new Map(
        signups.map((s: any) => [s.signup_email, s])
      );

      // Merge invitation and signup data
      const referrals = invitations.map((inv: any) => {
        const signup = signupMap.get(inv.referee_email) as any;
        
        // Determine the actual status based on signup data
        let actualStatus = inv.status;
        let created_at = inv.sent_at;
        
        if (signup) {
          if (signup.completed_at) {
            actualStatus = 'completed';
          } else if (signup.milestone_2_at) {
            actualStatus = 'milestone_2';
          } else if (signup.profile_created_at) {
            actualStatus = 'profile_created';
          }
          created_at = signup.profile_created_at || inv.sent_at;
        }

        return {
          id: inv.id,
          referee_email: inv.referee_email,
          target_type: inv.target_type,
          status: actualStatus,
          reward_amount: inv.reward_amount,
          reward_type: inv.reward_type,
          sent_at: inv.sent_at,
          clicked_at: inv.clicked_at,
          expires_at: inv.expires_at,
          created_at,
        };
      });

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