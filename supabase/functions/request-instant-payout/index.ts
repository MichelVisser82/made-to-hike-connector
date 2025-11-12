import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REQUEST-INSTANT-PAYOUT] ${step}${detailsStr}`);
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

    const { amount, currency } = await req.json();

    // Fetch guide profile
    const { data: guideProfile, error: profileError } = await supabaseClient
      .from('guide_profiles')
      .select('id, stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !guideProfile?.stripe_account_id) {
      throw new Error('No Stripe account found');
    }

    logStep('Checking account capabilities', { accountId: guideProfile.stripe_account_id });

    // Verify account supports instant payouts
    const account = await stripe.accounts.retrieve(guideProfile.stripe_account_id);
    
    if (!account.capabilities?.instant_payouts || account.capabilities.instant_payouts !== 'active') {
      throw new Error('Instant payouts are not available for this account. This feature is primarily available for US accounts with supported banks.');
    }

    if (!account.payouts_enabled) {
      throw new Error('Payouts are not enabled for this account. Please complete account verification.');
    }

    logStep('Checking balance', { accountId: guideProfile.stripe_account_id });

    // Check available balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: guideProfile.stripe_account_id,
    });

    const availableBalance = balance.available.find(b => b.currency === (currency || 'eur'));
    
    if (!availableBalance || availableBalance.amount < (amount || 0)) {
      throw new Error('Insufficient balance for instant payout');
    }

    logStep('Creating instant payout', { amount: amount || availableBalance.amount });

    // Create instant payout
    const payout = await stripe.payouts.create(
      {
        amount: amount || availableBalance.amount,
        currency: currency || 'eur',
        method: 'instant',
      },
      { stripeAccount: guideProfile.stripe_account_id }
    );

    logStep('Payout created', { payoutId: payout.id });

    // Record in database
    await supabaseClient.from('stripe_payouts').insert({
      guide_id: guideProfile.id,
      stripe_payout_id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
      status: payout.status,
      method: 'instant',
      metadata: payout,
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        payout_id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
      }),
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
