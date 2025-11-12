import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StripeConnectData {
  stripe_account_id: string | null;
  stripe_kyc_status: string;
  payout_schedule: string;
  bank_account_last4: string | null;
  stripe_requirements: any;
  account_link_url: string | null;
  account_link_expires_at: string | null;
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
        .select('stripe_account_id, stripe_kyc_status, payout_schedule, bank_account_last4, stripe_requirements, account_link_url, account_link_expires_at')
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
      const { data: response, error } = await supabase.functions.invoke('create-stripe-connected-account');

      if (error) throw error;

      toast.success('Stripe account created successfully');
      await fetchStripeData();
      
      return response;
    } catch (error: any) {
      console.error('Error creating Stripe account:', error);
      toast.error(error.message || 'Failed to create Stripe account');
      return null;
    }
  };

  const syncAccountStatus = async () => {
    if (!user || !data?.stripe_account_id) return;

    try {
      const { data: response, error } = await supabase.functions.invoke('get-stripe-account-status');

      if (error) throw error;

      await fetchStripeData();
      return response;
    } catch (error: any) {
      console.error('Error syncing account status:', error);
      return null;
    }
  };

  const createAccountLink = async () => {
    if (!user || !data?.stripe_account_id) return null;

    try {
      // Check if existing link is still valid
      if (data.account_link_expires_at) {
        const expiresAt = new Date(data.account_link_expires_at);
        if (expiresAt > new Date() && data.account_link_url) {
          return data.account_link_url;
        }
      }

      const { data: response, error } = await supabase.functions.invoke('create-stripe-account-link', {
        body: { 
          account_id: data.stripe_account_id,
          return_url: `${window.location.origin}/settings/payment`,
          refresh_url: `${window.location.origin}/settings/payment`,
        }
      });

      if (error) throw error;

      await fetchStripeData(); // Refresh to get new expiration
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
      const { error } = await supabase.functions.invoke('update-payout-schedule', {
        body: { schedule },
      });

      if (error) throw error;

      await fetchStripeData();
      toast.success('Payout schedule updated');
    } catch (error: any) {
      console.error('Error updating payout schedule:', error);
      toast.error(error.message || 'Failed to update payout schedule');
    }
  };

  const disconnectStripe = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('guide_profiles')
        .update({ 
          stripe_account_id: null,
          stripe_kyc_status: 'not_started',
          bank_account_last4: null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchStripeData();
      toast.success('Stripe account disconnected. You can now change your country and reconnect.');
    } catch (error: any) {
      console.error('Error disconnecting Stripe:', error);
      toast.error(error.message || 'Failed to disconnect Stripe');
    }
  };

  return {
    data,
    loading,
    createConnectedAccount,
    createAccountLink,
    syncAccountStatus,
    updatePayoutSchedule,
    disconnectStripe,
    refetch: fetchStripeData,
  };
}
