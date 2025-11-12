import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DAILY-BALANCE-RECONCILIATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep('Starting daily balance reconciliation');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all guides with Stripe accounts
    const { data: guides, error: guidesError } = await supabaseClient
      .from('guide_profiles')
      .select('user_id, stripe_account_id, display_name')
      .not('stripe_account_id', 'is', null);

    if (guidesError) throw guidesError;

    logStep('Found guides with Stripe accounts', { count: guides?.length || 0 });

    const today = new Date().toISOString().split('T')[0];
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const guide of guides || []) {
      try {
        logStep('Processing guide balance', { guideId: guide.user_id, accountId: guide.stripe_account_id });

        // Fetch balance from Stripe
        const balance = await stripe.balance.retrieve({
          stripeAccount: guide.stripe_account_id,
        });

        // Calculate totals from database
        const { data: transfers } = await supabaseClient
          .from('stripe_transfers')
          .select('amount, currency')
          .eq('destination_account', guide.stripe_account_id)
          .eq('status', 'succeeded');

        const { data: payouts } = await supabaseClient
          .from('stripe_payouts')
          .select('amount, currency')
          .eq('stripe_account_id', guide.stripe_account_id)
          .in('status', ['paid', 'in_transit']);

        const totalTransfers = transfers?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        const totalPayouts = payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        // Calculate platform fees (assuming 10% fee)
        const platformFees = totalTransfers * 0.10;

        // Insert or update snapshot
        const { error: snapshotError } = await supabaseClient
          .from('stripe_balance_snapshots')
          .upsert({
            guide_id: guide.user_id,
            stripe_account_id: guide.stripe_account_id,
            snapshot_date: today,
            available_balance: balance.available,
            pending_balance: balance.pending,
            reserved_balance: balance.reserved || [],
            total_transfers: totalTransfers / 100,
            total_payouts: totalPayouts / 100,
            platform_fees_collected: platformFees / 100,
          }, {
            onConflict: 'guide_id,snapshot_date',
          });

        if (snapshotError) throw snapshotError;

        results.processed++;
        logStep('Balance snapshot created', { guideId: guide.user_id });

      } catch (error: any) {
        logStep('Failed to process guide balance', { guideId: guide.user_id, error: error.message });
        results.failed++;
        results.errors.push({
          guide_id: guide.user_id,
          error: error.message,
        });
      }
    }

    logStep('Reconciliation completed', results);

    return new Response(
      JSON.stringify({ success: true, results }),
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
