import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StripeConnectData {
  stripe_account_id: string | null;
  stripe_kyc_status: string;
  payout_schedule: string;
  bank_account_last4: string | null;
}

export function useStripeConnect() {
  const { user } = useAuth();
  const [data, setData] = useState<StripeConnectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStripeData();
    }
  }, [user]);

  const fetchStripeData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: guideData, error } = await supabase
        .from('guide_profiles')
        .select('stripe_account_id, stripe_kyc_status, payout_schedule, bank_account_last4')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setData(guideData);
    } catch (error: any) {
      console.error('Error fetching Stripe data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConnectedAccount = async () => {
    if (!user) return;

    try {
      const { data: response, error } = await supabase.functions.invoke('create-stripe-connected-account', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      toast.success('Stripe account created');
      await fetchStripeData();
      
      return response;
    } catch (error: any) {
      console.error('Error creating Stripe account:', error);
      toast.error('Failed to create Stripe account');
      return null;
    }
  };

  const createAccountLink = async () => {
    if (!user || !data?.stripe_account_id) return null;

    try {
      const { data: response, error } = await supabase.functions.invoke('create-stripe-account-link', {
        body: { 
          account_id: data.stripe_account_id,
          return_url: `${window.location.origin}/settings/payment`,
          refresh_url: `${window.location.origin}/settings/payment`,
        }
      });

      if (error) throw error;

      return response.url;
    } catch (error: any) {
      console.error('Error creating account link:', error);
      toast.error('Failed to create verification link');
      return null;
    }
  };

  const updatePayoutSchedule = async (schedule: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('guide_profiles')
        .update({ payout_schedule: schedule })
        .eq('user_id', user.id);

      if (error) throw error;

      setData(data ? { ...data, payout_schedule: schedule } : null);
      toast.success('Payout schedule updated');
    } catch (error: any) {
      console.error('Error updating payout schedule:', error);
      toast.error('Failed to update payout schedule');
    }
  };

  return {
    data,
    loading,
    createConnectedAccount,
    createAccountLink,
    updatePayoutSchedule,
    refetch: fetchStripeData,
  };
}
