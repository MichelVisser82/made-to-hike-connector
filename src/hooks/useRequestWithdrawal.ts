import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRequestWithdrawal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const requestWithdrawal = async (amount: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-credit-withdrawal', {
        body: { amount }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return { success: false, error: data.error };
      }

      toast.success(`Withdrawal request submitted! €${amount.toFixed(2)} will be processed in 3-5 business days.`);
      return { success: true, data: data.withdrawal };
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || 'Failed to process withdrawal request');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { requestWithdrawal, isLoading };
};
