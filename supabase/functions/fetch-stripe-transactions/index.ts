import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FETCH-TRANSACTIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) throw new Error('User not authenticated');
    logStep('User authenticated', { userId: user.id });

    // Fetch guide profile
    const { data: guideProfile, error: profileError } = await supabaseClient
      .from('guide_profiles')
      .select('id, stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !guideProfile?.stripe_account_id) {
      throw new Error('No Stripe account found');
    }

    logStep('Fetching balance transactions', { accountId: guideProfile.stripe_account_id });

    // Fetch balance transactions from Stripe
    const transactions = await stripe.balanceTransactions.list(
      { limit: 100 },
      { stripeAccount: guideProfile.stripe_account_id }
    );

    logStep('Transactions retrieved', { count: transactions.data.length });

    // Link transactions to bookings
    const enrichedTransactions = [];
    for (const txn of transactions.data) {
      let bookingInfo = null;
      
      if (txn.source) {
        // Try to find booking from payment intent
        const { data: booking } = await supabaseClient
          .from('bookings')
          .select('id, tour_id, tours(title)')
          .eq('stripe_payment_intent_id', txn.source)
          .single();
        
        if (booking) {
          bookingInfo = booking;
        }
      }

      enrichedTransactions.push({
        ...txn,
        booking: bookingInfo,
      });
    }

    return new Response(
      JSON.stringify({ transactions: enrichedTransactions }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
