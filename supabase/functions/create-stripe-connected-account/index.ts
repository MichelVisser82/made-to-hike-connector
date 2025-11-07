import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CONNECTED-ACCOUNT] ${step}${detailsStr}`);
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
      .select('id, email, first_name, last_name, stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !guideProfile) {
      throw new Error('Guide profile not found');
    }

    logStep('Guide profile found', { guideId: guideProfile.id });

    // Check if account already exists
    if (guideProfile.stripe_account_id) {
      logStep('Account already exists', { accountId: guideProfile.stripe_account_id });
      return new Response(
        JSON.stringify({ 
          account_id: guideProfile.stripe_account_id,
          message: 'Stripe account already exists'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe Express Connected Account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Default, can be updated during onboarding
      email: guideProfile.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        product_description: 'Guided hiking tours and outdoor adventures',
      },
      metadata: {
        guide_id: guideProfile.id,
        user_id: user.id,
      },
    });

    logStep('Stripe account created', { accountId: account.id });

    // Update guide profile with Stripe account ID
    const { error: updateError } = await supabaseClient
      .from('guide_profiles')
      .update({ 
        stripe_account_id: account.id,
        stripe_kyc_status: 'pending',
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep('Error updating profile', { error: updateError });
      throw updateError;
    }

    logStep('Profile updated successfully');

    return new Response(
      JSON.stringify({ 
        account_id: account.id,
        status: 'created',
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
