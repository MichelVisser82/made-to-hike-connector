import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-PAYOUT-SCHEDULE] ${step}${detailsStr}`);
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

    const { schedule } = await req.json();

    if (!schedule || !['daily', 'weekly', 'monthly', 'manual'].includes(schedule)) {
      throw new Error('Invalid payout schedule');
    }

    // Fetch guide profile
    const { data: guideProfile, error: profileError } = await supabaseClient
      .from('guide_profiles')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !guideProfile?.stripe_account_id) {
      throw new Error('No Stripe account found');
    }

    logStep('Updating payout schedule', { 
      accountId: guideProfile.stripe_account_id,
      schedule,
    });

    // Update Stripe account settings
    await stripe.accounts.update(guideProfile.stripe_account_id, {
      settings: {
        payouts: {
          schedule: {
            interval: schedule,
          },
        },
      },
    });

    // Update database
    const { error: updateError } = await supabaseClient
      .from('guide_profiles')
      .update({ payout_schedule: schedule })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    logStep('Payout schedule updated successfully');

    return new Response(
      JSON.stringify({ success: true, schedule }),
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
