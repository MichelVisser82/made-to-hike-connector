import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-WEBHOOK-QUEUE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep('Processing webhook queue');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch pending events that are ready to retry
    const { data: queuedEvents, error: fetchError } = await supabaseClient
      .from('webhook_processing_queue')
      .select('*')
      .in('processing_status', ['pending', 'failed'])
      .or('next_retry_at.is.null,next_retry_at.lte.' + new Date().toISOString())
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) throw fetchError;

    logStep('Found queued events', { count: queuedEvents?.length || 0 });

    const results = {
      processed: 0,
      failed: 0,
      max_retries_reached: 0,
    };

    for (const queuedEvent of queuedEvents || []) {
      try {
        // Mark as processing
        await supabaseClient
          .from('webhook_processing_queue')
          .update({ processing_status: 'processing' })
          .eq('id', queuedEvent.id);

        logStep('Processing event', { eventType: queuedEvent.event_type, eventId: queuedEvent.event_id });

        // Process the event
        await processWebhookEvent(queuedEvent.event_type, queuedEvent.event_data, supabaseClient);

        // Mark as completed
        await supabaseClient
          .from('webhook_processing_queue')
          .update({
            processing_status: 'completed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', queuedEvent.id);

        results.processed++;
        logStep('Event processed successfully', { eventId: queuedEvent.event_id });
      } catch (error: any) {
        logStep('Event processing failed', { eventId: queuedEvent.event_id, error: error.message });

        const newRetryCount = queuedEvent.retry_count + 1;
        
        if (newRetryCount >= queuedEvent.max_retries) {
          // Max retries reached
          await supabaseClient
            .from('webhook_processing_queue')
            .update({
              processing_status: 'failed',
              retry_count: newRetryCount,
              error_message: error.message,
              processed_at: new Date().toISOString(),
            })
            .eq('id', queuedEvent.id);
          
          results.max_retries_reached++;
        } else {
          // Schedule next retry with exponential backoff
          const nextRetryDelay = Math.pow(2, newRetryCount) * 60 * 1000; // 2min, 4min, 8min
          const nextRetryAt = new Date(Date.now() + nextRetryDelay);

          await supabaseClient
            .from('webhook_processing_queue')
            .update({
              processing_status: 'failed',
              retry_count: newRetryCount,
              error_message: error.message,
              next_retry_at: nextRetryAt.toISOString(),
            })
            .eq('id', queuedEvent.id);

          results.failed++;
        }
      }
    }

    logStep('Queue processing completed', results);

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

async function processWebhookEvent(eventType: string, eventData: any, supabaseClient: any) {
  switch (eventType) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(eventData, supabaseClient);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(eventData, supabaseClient);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(eventData, supabaseClient);
      break;
    case 'account.updated':
      await syncAccountStatus(eventData.id, supabaseClient);
      break;
    case 'payout.failed':
      await handlePayoutFailed(eventData, supabaseClient);
      break;
    case 'transfer.failed':
      await handleTransferFailed(eventData, supabaseClient);
      break;
    case 'transfer.reversed':
      await handleTransferReversed(eventData, supabaseClient);
      break;
    case 'capability.updated':
      await handleCapabilityUpdated(eventData, supabaseClient);
      break;
    default:
      logStep('Unhandled event type in processor', { type: eventType });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any, supabaseClient: any) {
  const bookingReference = paymentIntent.metadata?.booking_reference;
  if (!bookingReference) return;

  const { error } = await supabaseClient
    .from('bookings')
    .update({
      payment_status: paymentIntent.metadata?.payment_type === 'full' ? 'paid' : 'deposit_paid',
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString(),
    })
    .eq('booking_reference', bookingReference);

  if (error) throw error;
}

async function handlePaymentIntentFailed(paymentIntent: any, supabaseClient: any) {
  const bookingReference = paymentIntent.metadata?.booking_reference;
  if (!bookingReference) return;

  const { error } = await supabaseClient
    .from('bookings')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('booking_reference', bookingReference);

  if (error) throw error;
}

async function handleChargeRefunded(charge: any, supabaseClient: any) {
  const paymentIntentId = charge.payment_intent;
  if (!paymentIntentId) return;

  const { data: booking } = await supabaseClient
    .from('bookings')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (booking) {
    await supabaseClient
      .from('bookings')
      .update({
        payment_status: charge.amount_refunded === charge.amount ? 'refunded' : 'partially_refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);
  }
}

async function syncAccountStatus(accountId: string, supabaseClient: any) {
  const account = await stripe.accounts.retrieve(accountId);
  
  const updates: any = {
    stripe_kyc_status: determineKycStatus(account),
    updated_at: new Date().toISOString(),
  };

  if (account.requirements) {
    updates.stripe_requirements = {
      currently_due: account.requirements.currently_due || [],
      eventually_due: account.requirements.eventually_due || [],
      past_due: account.requirements.past_due || [],
      pending_verification: account.requirements.pending_verification || [],
      disabled_reason: account.requirements.disabled_reason || null,
      errors: account.requirements.errors || [],
      current_deadline: account.requirements.current_deadline || null,
    };
  }

  if (account.external_accounts?.data?.[0]) {
    const bankAccount = account.external_accounts.data[0];
    if (bankAccount.object === 'bank_account') {
      updates.bank_account_last4 = bankAccount.last4;
    }
  }

  await supabaseClient
    .from('guide_profiles')
    .update(updates)
    .eq('stripe_account_id', accountId);
}

function determineKycStatus(account: any): string {
  if (account.requirements?.disabled_reason) return 'failed';
  if (account.payouts_enabled && account.charges_enabled) return 'verified';
  if (account.requirements?.currently_due?.length > 0) return 'incomplete';
  if (account.requirements?.pending_verification?.length > 0) return 'pending';
  return 'incomplete';
}

async function handlePayoutFailed(payout: any, supabaseClient: any) {
  logStep('Processing failed payout', { payoutId: payout.id });

  await supabaseClient
    .from('stripe_payouts')
    .update({
      status: 'failed',
      failure_code: payout.failure_code,
      failure_message: payout.failure_message,
    })
    .eq('payout_id', payout.id);

  const { data: guide } = await supabaseClient
    .from('guide_profiles')
    .select('user_id, display_name')
    .eq('stripe_account_id', payout.destination)
    .single();

  if (guide) {
    await supabaseClient.functions.invoke('send-email', {
      body: {
        to: guide.user_id,
        template: 'payout_failed',
        data: {
          guide_name: guide.display_name,
          amount: (payout.amount / 100).toFixed(2),
          currency: payout.currency.toUpperCase(),
          failure_reason: payout.failure_message || 'Unknown error',
        },
      },
    });
  }
}

async function handleTransferFailed(transfer: any, supabaseClient: any) {
  logStep('Processing failed transfer', { transferId: transfer.id });

  await supabaseClient
    .from('stripe_transfers')
    .update({
      status: 'failed',
      failure_code: transfer.failure_code,
      failure_message: transfer.failure_message,
    })
    .eq('transfer_id', transfer.id);
}

async function handleTransferReversed(transfer: any, supabaseClient: any) {
  logStep('Processing reversed transfer', { transferId: transfer.id });

  await supabaseClient
    .from('stripe_transfers')
    .update({
      status: 'reversed',
      reversed_at: new Date().toISOString(),
    })
    .eq('transfer_id', transfer.id);

  const { data: guide } = await supabaseClient
    .from('guide_profiles')
    .select('user_id, display_name')
    .eq('stripe_account_id', transfer.destination)
    .single();

  if (guide) {
    await supabaseClient.functions.invoke('send-email', {
      body: {
        to: guide.user_id,
        template: 'transfer_reversed',
        data: {
          guide_name: guide.display_name,
          amount: (transfer.amount / 100).toFixed(2),
          currency: transfer.currency.toUpperCase(),
          reason: 'Dispute or chargeback',
        },
      },
    });
  }
}

async function handleCapabilityUpdated(capability: any, supabaseClient: any) {
  logStep('Processing capability update', { account: capability.account, capability: capability.id });
  await syncAccountStatus(capability.account, supabaseClient);
}
