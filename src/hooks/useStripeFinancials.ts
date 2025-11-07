import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useStripeFinancials() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user]);

  const fetchFinancialData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [balanceRes, payoutsRes, transactionsRes] = await Promise.all([
        supabase.functions.invoke('fetch-stripe-balance'),
        supabase.functions.invoke('fetch-stripe-payouts'),
        supabase.functions.invoke('fetch-stripe-transactions'),
      ]);

      if (balanceRes.data) setBalance(balanceRes.data);
      if (payoutsRes.data) setPayouts(payoutsRes.data.payouts || []);
      if (transactionsRes.data) setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestInstantPayout = async (amount?: number, currency?: string) => {
    const { data, error } = await supabase.functions.invoke('request-instant-payout', {
      body: { amount, currency },
    });

    if (!error) {
      await fetchFinancialData();
    }

    return { data, error };
  };

  return {
    balance,
    payouts,
    transactions,
    loading,
    refetch: fetchFinancialData,
    requestInstantPayout,
  };
}
