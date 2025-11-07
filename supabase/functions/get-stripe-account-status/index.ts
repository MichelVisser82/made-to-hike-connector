import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-ACCOUNT-STATUS] ${step}${detailsStr}`);
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
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !guideProfile || !guideProfile.stripe_account_id) {
      throw new Error('No Stripe account found');
    }

    logStep('Fetching account from Stripe', { accountId: guideProfile.stripe_account_id });

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(guideProfile.stripe_account_id);

    logStep('Account retrieved', { 
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
    });

    // Determine KYC status
    let kycStatus = 'pending';
    if (account.charges_enabled && account.details_submitted) {
      kycStatus = 'verified';
    } else if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
      kycStatus = 'incomplete';
    } else if (account.requirements?.disabled_reason) {
      kycStatus = 'failed';
    }

    // Get bank account info (last4)
    let bankAccountLast4 = null;
    if (account.external_accounts?.data && account.external_accounts.data.length > 0) {
      const bankAccount = account.external_accounts.data[0];
      if (bankAccount.object === 'bank_account') {
        bankAccountLast4 = bankAccount.last4;
      }
    }

    // Update guide profile
    const { error: updateError } = await supabaseClient
      .from('guide_profiles')
      .update({ 
        stripe_kyc_status: kycStatus,
        bank_account_last4: bankAccountLast4,
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep('Error updating profile', { error: updateError });
    } else {
      logStep('Profile updated successfully');
    }

    return new Response(
      JSON.stringify({ 
        account_id: account.id,
        kyc_status: kycStatus,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        bank_account_last4: bankAccountLast4,
        requirements_due: account.requirements?.currently_due || [],
        payout_schedule: account.settings?.payouts?.schedule,
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
