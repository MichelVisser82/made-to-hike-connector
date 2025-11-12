import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RETRY-TRANSFERS] ${step}${detailsStr}`);
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

    // Find transfers that need retry
    const { data: failedTransfers, error: fetchError } = await supabaseClient
      .from('stripe_transfers')
      .select('*')
      .eq('status', 'failed')
      .lt('retry_count', 3) // Max 3 retries
      .lte('next_retry_at', new Date().toISOString())
      .limit(10);

    if (fetchError) throw fetchError;

    if (!failedTransfers || failedTransfers.length === 0) {
      logStep('No transfers to retry');
      return new Response(
        JSON.stringify({ message: 'No transfers to retry', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Found transfers to retry', { count: failedTransfers.length });

    const results = [];

    for (const transfer of failedTransfers) {
      try {
        logStep('Retrying transfer', { transferId: transfer.stripe_transfer_id });

        // Get original payment intent
        const originalTransfer = await stripe.transfers.retrieve(transfer.stripe_transfer_id);
        const paymentIntent = await stripe.paymentIntents.retrieve(originalTransfer.source_transaction as string);

        // Check guide account status
        const account = await stripe.accounts.retrieve(transfer.destination_account_id);
        
        if (!account.charges_enabled || !account.payouts_enabled) {
          logStep('Account not ready', { accountId: transfer.destination_account_id });
          
          // Update to increase retry count and schedule next retry
          await supabaseClient
            .from('stripe_transfers')
            .update({
              retry_count: transfer.retry_count + 1,
              next_retry_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Wait 48h
            })
            .eq('id', transfer.id);

          results.push({ transferId: transfer.stripe_transfer_id, status: 'skipped', reason: 'account_not_ready' });
          continue;
        }

        // Create new transfer
        const newTransfer = await stripe.transfers.create({
          amount: transfer.amount,
          currency: transfer.currency,
          destination: transfer.destination_account_id,
          source_transaction: originalTransfer.source_transaction,
          description: `Retry of failed transfer ${transfer.stripe_transfer_id}`,
          metadata: {
            original_transfer_id: transfer.stripe_transfer_id,
            retry_attempt: transfer.retry_count + 1,
            booking_id: paymentIntent.metadata?.booking_id,
          },
        });

        logStep('Transfer created', { newTransferId: newTransfer.id });

        // Update original transfer record
        await supabaseClient
          .from('stripe_transfers')
          .update({
            status: 'retried',
            retry_count: transfer.retry_count + 1,
          })
          .eq('id', transfer.id);

        // Create new transfer record
        await supabaseClient
          .from('stripe_transfers')
          .insert({
            stripe_transfer_id: newTransfer.id,
            booking_id: transfer.booking_id,
            guide_id: transfer.guide_id,
            amount: newTransfer.amount,
            currency: newTransfer.currency,
            destination_account_id: newTransfer.destination,
            status: 'pending',
            retry_count: 0,
            metadata: newTransfer,
          });

        results.push({ transferId: transfer.stripe_transfer_id, status: 'retried', newTransferId: newTransfer.id });

      } catch (error) {
        logStep('Transfer retry failed', { transferId: transfer.stripe_transfer_id, error: error.message });

        // Update retry count and schedule next retry
        await supabaseClient
          .from('stripe_transfers')
          .update({
            retry_count: transfer.retry_count + 1,
            next_retry_at: transfer.retry_count + 1 >= 3 
              ? null // No more retries
              : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', transfer.id);

        results.push({ transferId: transfer.stripe_transfer_id, status: 'failed', error: error.message });
      }
    }

    logStep('Retry complete', { processed: results.length });

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results,
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
