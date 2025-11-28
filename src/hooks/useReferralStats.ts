import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReferralStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['referral-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      // Fetch stats from manage-referrals
      const { data, error } = await supabase.functions.invoke('manage-referrals', {
        body: { action: 'get_stats', userId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const raw = data.stats;

      // Fetch actual credits from user_credits table
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('amount, status')
        .eq('user_id', userId);

      if (creditsError) throw creditsError;

      // Normalize backend stats into the shape expected by the UI components
      const invitations = raw?.invitations ?? [];
      const signups = raw?.signups ?? [];

      // Create maps for efficient lookup - try multiple matching strategies
      const signupByEmail = new Map(signups.map((s: any) => [s.signup_email, s]));
      const signupByProfileEmail = new Map(signups.map((s: any) => [s.profile_email, s]).filter(([k]) => k));
      const signupByInvEmail = new Map(signups.map((s: any) => [s.invitation_email, s]).filter(([k]) => k));

      // Merge invitation and signup data
      const referrals = invitations.map((inv: any) => {
        // Try multiple matching strategies:
        // 1. Match by invitation email (most reliable if linked)
        let signup = signupByInvEmail.get(inv.referee_email) as any;
        // 2. Match by current profile email (handles email changes)
        if (!signup) {
          signup = signupByProfileEmail.get(inv.referee_email) as any;
        }
        // 3. Fallback to original signup email
        if (!signup) {
          signup = signupByEmail.get(inv.referee_email) as any;
        }
        
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
      const acceptedInvites = raw?.total_signups ?? signups.length;
      const totalReferrals = totalInvites;

      // Calculate credits from user_credits table
      const activeCredits = credits?.filter((c: any) => c.status === 'active') || [];
      const totalCredits = activeCredits.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
      const availableCredits = totalCredits; // All active credits are available

      // Calculate pending credits from signups
      const pendingCredits = signups
        .filter((s: any) => s.reward_status === 'pending')
        .reduce((sum: number, s: any) => sum + (s.reward_amount || 0), 0);

      return {
        ...raw,
        referrals,
        totalInvites,
        totalReferrals,
        acceptedInvites,
        completedReferrals,
        totalCredits,
        availableCredits,
        pendingCredits,
        totalEarned: totalCredits, // Alias for backward compatibility
      };
    },
    enabled: !!userId,
  });
};