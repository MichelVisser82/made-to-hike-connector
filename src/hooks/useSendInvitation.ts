import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSendInvitation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendInvitation = async (
    userId: string,
    targetEmail: string,
    targetType: 'hiker' | 'guide',
    personalMessage?: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-referrals', {
        body: {
          action: 'send_invitation',
          userId,
          targetEmail,
          targetType,
          personalMessage,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Invitation sent successfully!');
      return data;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendInvitation, isLoading };
};
