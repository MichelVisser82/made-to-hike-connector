import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ACCOUNT-LINK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const { account_id, return_url, refresh_url } = await req.json();

    if (!account_id) {
      throw new Error('account_id is required');
    }

    logStep('Creating account link', { accountId: account_id });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account_id,
      refresh_url: refresh_url || `${new URL(req.url).origin}/dashboard?section=settings&tab=payment`,
      return_url: return_url || `${new URL(req.url).origin}/dashboard?section=settings&tab=payment&stripe_success=true`,
      type: 'account_onboarding',
    });

    logStep('Account link created', { url: accountLink.url, expiresAt: accountLink.expires_at });

    // Store account link URL and expiration in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient
      .from('guide_profiles')
      .update({
        account_link_url: accountLink.url,
        account_link_expires_at: new Date(accountLink.expires_at * 1000).toISOString(),
      })
      .eq('stripe_account_id', account_id);

    return new Response(
      JSON.stringify({ 
        url: accountLink.url,
        expires_at: accountLink.expires_at,
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
