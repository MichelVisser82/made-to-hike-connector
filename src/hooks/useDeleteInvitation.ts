import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteInvitation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const deleteInvitation = async (userId: string, refereeEmail: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-referrals', {
        body: {
          action: 'delete_invitation',
          userId,
          refereeEmail,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Refresh referral stats
      await queryClient.invalidateQueries({ queryKey: ['referral-stats', userId] });

      toast.success('Invitation removed successfully');
      return data;
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast.error(error.message || 'Failed to remove invitation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteInvitation, isLoading };
};
