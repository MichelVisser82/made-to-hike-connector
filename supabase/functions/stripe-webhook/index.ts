import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    logStep('ERROR: No signature header');
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    logStep('Event received', { type: event.type, id: event.id });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log webhook event
    await supabaseClient.from('stripe_webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event,
      processed: false,
    });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event, supabaseClient);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event, supabaseClient);
        break;

      case 'transfer.created':
        await handleTransferCreated(event, supabaseClient);
        break;

      case 'transfer.paid':
        await handleTransferPaid(event, supabaseClient);
        break;

      case 'account.updated':
        await syncAccountStatus(event, supabaseClient);
        break;

      case 'payout.created':
        await handlePayoutCreated(event, supabaseClient);
        break;

      case 'payout.paid':
        await handlePayoutPaid(event, supabaseClient);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event, supabaseClient);
        break;

      default:
        logStep('Unhandled event type', { type: event.type });
    }

    // Mark as processed
    await supabaseClient
      .from('stripe_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    logStep('ERROR', { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});

async function handlePaymentSuccess(event: any, supabase: any) {
  const paymentIntent = event.data.object;
  logStep('Payment succeeded', { paymentIntentId: paymentIntent.id });

  // Update booking status
  const { error } = await supabase
    .from('bookings')
    .update({ payment_status: 'succeeded', status: 'confirmed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    logStep('Error updating booking', { error });
  }
}

async function handlePaymentFailed(event: any, supabase: any) {
  const paymentIntent = event.data.object;
  const failureCode = paymentIntent.last_payment_error?.code;
  const failureMessage = paymentIntent.last_payment_error?.message;
  
  logStep('Payment failed', { 
    paymentIntentId: paymentIntent.id,
    code: failureCode,
    message: failureMessage 
  });

  // Update booking with failure details
  const { error } = await supabase
    .from('bookings')
    .update({ 
      payment_status: 'failed',
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    logStep('Error updating booking', { error });
    return;
  }

  // Send email notification to hiker
  const { data: booking } = await supabase
    .from('bookings')
    .select('hiker_id, tour_id, profiles!bookings_hiker_id_fkey(email, name)')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (booking) {
    const errorMessage = getUserFriendlyErrorMessage(failureCode);
    await supabase.functions.invoke('send-email', {
      body: {
        to: booking.profiles.email,
        subject: 'Payment Failed - Action Required',
        html: `
          <h2>Payment Failed</h2>
          <p>Dear ${booking.profiles.name},</p>
          <p>Unfortunately, your payment could not be processed.</p>
          <p><strong>Reason:</strong> ${errorMessage}</p>
          <p>Please try booking again with a different payment method.</p>
        `
      }
    });
  }
}

function getUserFriendlyErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'card_declined': 'Your card was declined. Please try a different payment method.',
    'insufficient_funds': 'Your card has insufficient funds. Please use a different card.',
    'expired_card': 'Your card has expired. Please update your payment method.',
    'incorrect_cvc': 'The card security code is incorrect. Please check and try again.',
    'processing_error': 'A processing error occurred. Please try again.',
    'rate_limit': 'Too many attempts. Please wait a few minutes and try again.',
  };
  return messages[code] || 'Payment failed. Please try again with a different payment method.';
}

async function handleTransferCreated(event: any, supabase: any) {
  const transfer = event.data.object;
  logStep('Transfer created', { transferId: transfer.id });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(transfer.source_transaction);
    const metadata = paymentIntent.metadata;

    if (metadata.guide_id && metadata.tour_id) {
      await supabase.from('stripe_transfers').insert({
        stripe_transfer_id: transfer.id,
        booking_id: metadata.booking_id || null,
        guide_id: metadata.guide_id,
        amount: transfer.amount,
        currency: transfer.currency,
        destination_account_id: transfer.destination,
        status: 'pending',
        retry_count: 0,
        metadata: transfer,
      });
    }
  } catch (error) {
    logStep('Transfer creation error', { error: error.message });
    
    // Schedule retry in 24 hours
    await supabase.from('stripe_transfers').insert({
      stripe_transfer_id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      destination_account_id: transfer.destination,
      status: 'failed',
      retry_count: 0,
      next_retry_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      metadata: transfer,
    });
  }
}

async function handleTransferPaid(event: any, supabase: any) {
  const transfer = event.data.object;
  logStep('Transfer paid', { transferId: transfer.id });

  await supabase
    .from('stripe_transfers')
    .update({ 
      status: 'paid',
      transferred_at: new Date(transfer.created * 1000).toISOString(),
    })
    .eq('stripe_transfer_id', transfer.id);
}

async function syncAccountStatus(event: any, supabase: any) {
  const account = event.data.object;
  logStep('Account updated', { accountId: account.id });

  let kycStatus = 'pending';
  if (account.charges_enabled && account.details_submitted) {
    kycStatus = 'verified';
  } else if (account.requirements?.currently_due?.length > 0) {
    kycStatus = 'incomplete';
  } else if (account.requirements?.disabled_reason) {
    kycStatus = 'failed';
  }

  await supabase
    .from('guide_profiles')
    .update({ stripe_kyc_status: kycStatus })
    .eq('stripe_account_id', account.id);
}

async function handlePayoutCreated(event: any, supabase: any) {
  const payout = event.data.object;
  logStep('Payout created', { payoutId: payout.id });

  // Find guide by connected account
  const { data: guide } = await supabase
    .from('guide_profiles')
    .select('id')
    .eq('stripe_account_id', payout.destination)
    .single();

  if (guide) {
    await supabase.from('stripe_payouts').insert({
      guide_id: guide.id,
      stripe_payout_id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
      status: 'pending',
      method: payout.method,
      metadata: payout,
    });
  }
}

async function handlePayoutPaid(event: any, supabase: any) {
  const payout = event.data.object;
  logStep('Payout paid', { payoutId: payout.id });

  await supabase
    .from('stripe_payouts')
    .update({ 
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('stripe_payout_id', payout.id);
}

async function handlePayoutFailed(event: any, supabase: any) {
  const payout = event.data.object;
  logStep('Payout failed', { payoutId: payout.id });

  await supabase
    .from('stripe_payouts')
    .update({ status: 'failed' })
    .eq('stripe_payout_id', payout.id);
}
