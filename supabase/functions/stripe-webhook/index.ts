import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
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

    logStep('Event received', { type: event.type, id: event.id, apiVersion: event.api_version, livemode: event.livemode });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if event already processed (idempotency)
    const { data: existingEvent } = await supabaseClient
      .from('stripe_webhook_events')
      .select('processed')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent?.processed) {
      logStep('Event already processed, skipping', { eventId: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    // Log webhook event with api_version and livemode
    await supabaseClient.from('stripe_webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event,
      api_version: event.api_version,
      livemode: event.livemode,
      processed: false,
    });

    // Queue event for async processing
    await supabaseClient.from('webhook_processing_queue').insert({
      event_id: event.id,
      event_type: event.type,
      event_data: event.data.object,
      api_version: event.api_version,
      livemode: event.livemode,
      processing_status: 'pending',
    });

    logStep('Event queued for async processing', { eventId: event.id });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.processing':
        await handlePaymentProcessing(event, supabaseClient);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event, supabaseClient);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event, supabaseClient);
        break;

      case 'charge.succeeded':
        // Backup handler in case payment_intent.succeeded is missed
        await handleChargeSuccess(event, supabaseClient);
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

      case 'transfer.failed':
        await handleTransferFailed(event, supabaseClient);
        break;

      case 'account.external_account.created':
      case 'account.external_account.updated':
      case 'account.external_account.deleted':
        await syncAccountStatus(event, supabaseClient);
        break;

      case 'capability.updated':
        await handleCapabilityUpdated(event, supabaseClient);
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
    
    // If signature verification failed, return 200 to stop retries
    if (error.message?.includes('signature') || error.message?.includes('Signature')) {
      logStep('SECURITY: Invalid signature - possible attack', { signature });
      return new Response(
        JSON.stringify({ received: false, reason: 'invalid_signature' }), 
        { status: 200 }
      );
    }
    
    // For other errors, return 400 so Stripe retries
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});

async function handlePaymentProcessing(event: any, supabase: any) {
  const paymentIntent = event.data.object;
  const bookingId = paymentIntent.metadata?.booking_id;
  
  logStep('Payment processing', { 
    paymentIntentId: paymentIntent.id,
    bookingId,
    paymentMethod: paymentIntent.payment_method_types 
  });

  if (!bookingId) {
    logStep('No booking_id in metadata, skipping');
    return;
  }

  // Update booking status to processing (for SEPA, bank transfers, etc.)
  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ 
      payment_status: 'processing',
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select('id, booking_reference, hiker_id, hiker_email, profiles!bookings_hiker_id_fkey(name)')
    .single();

  if (error) {
    logStep('Error updating booking to processing', { error });
    return;
  }

  if (booking) {
    logStep('Booking updated to processing', { 
      bookingId: booking.id, 
      bookingReference: booking.booking_reference 
    });

    // Send email notification about processing payment
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: booking.hiker_email,
          subject: `Payment Processing - Booking ${booking.booking_reference}`,
          html: `
            <h2>Payment Being Processed</h2>
            <p>Dear ${booking.profiles.name},</p>
            <p>Your booking <strong>${booking.booking_reference}</strong> has been created and your payment is being processed.</p>
            <p>SEPA payments typically take 3-5 business days to complete. You will receive a confirmation email once the payment is successful.</p>
            <p>Your booking is confirmed and the guide has been notified.</p>
            <p>Thank you for your patience!</p>
          `
        }
      });
      logStep('Processing notification email sent');
    } catch (emailError) {
      logStep('Error sending processing email', { error: emailError });
    }
  }
}

async function handlePaymentSuccess(event: any, supabase: any) {
  const paymentIntent = event.data.object;
  const bookingId = paymentIntent.metadata?.booking_id;
  const isFinalPayment = paymentIntent.metadata?.is_final_payment === 'true';
  
  logStep('Payment succeeded', { 
    paymentIntentId: paymentIntent.id,
    bookingId,
    isFinalPayment
  });

  if (!bookingId) {
    logStep('No booking_id in metadata, skipping');
    return;
  }

  // Different handling for initial deposit vs final payment
  if (isFinalPayment) {
    // Update final payment status
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ 
        final_payment_status: 'paid',
        final_payment_intent_id: paymentIntent.id,
        payment_status: 'succeeded',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select('id, booking_reference, hiker_id, hiker_email, profiles!bookings_hiker_id_fkey(name)')
      .single();

    if (error) {
      logStep('Error updating final payment', { error });
      return;
    }

    logStep('Final payment confirmed', { 
      bookingId: booking.id, 
      bookingReference: booking.booking_reference 
    });

  } else {
    // Update initial payment status
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ 
        payment_status: 'succeeded', 
        status: 'confirmed',
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select('id, booking_reference, hiker_id, hiker_email, payment_type, final_payment_due_date, profiles!bookings_hiker_id_fkey(name)')
      .single();

    if (error) {
      logStep('Error updating booking', { error });
      return;
    }

    if (booking) {
      logStep('Booking payment confirmed', { 
        bookingId: booking.id, 
        bookingReference: booking.booking_reference 
      });

      // Send email notification about successful payment
      try {
        const isDeposit = booking.payment_type === 'deposit';
        const emailHtml = isDeposit ? `
          <h2>Deposit Payment Confirmed!</h2>
          <p>Dear ${booking.profiles.name},</p>
          <p>Great news! Your deposit payment has been successfully processed.</p>
          <p>Your booking <strong>${booking.booking_reference}</strong> is now confirmed.</p>
          <p><strong>Important:</strong> Your final payment will be automatically charged on ${new Date(booking.final_payment_due_date).toLocaleDateString()}.</p>
          <p>You can view all the details in your dashboard.</p>
          <p>Looking forward to your adventure!</p>
        ` : `
          <h2>Payment Confirmed!</h2>
          <p>Dear ${booking.profiles.name},</p>
          <p>Great news! Your payment has been successfully processed.</p>
          <p>Your booking <strong>${booking.booking_reference}</strong> is now fully confirmed.</p>
          <p>You can view all the details in your dashboard.</p>
          <p>Looking forward to your adventure!</p>
        `;

        await supabase.functions.invoke('send-email', {
          body: {
            to: booking.hiker_email,
            subject: `Payment Confirmed - Booking ${booking.booking_reference}`,
            html: emailHtml
          }
        });
        logStep('Payment confirmation email sent');
      } catch (emailError) {
        logStep('Error sending confirmation email', { error: emailError });
      }
    }
  }
}

async function handleChargeSuccess(event: any, supabase: any) {
  const charge = event.data.object;
  const paymentIntentId = charge.payment_intent;
  
  if (!paymentIntentId) {
    logStep('Charge succeeded but no payment intent', { chargeId: charge.id });
    return;
  }

  logStep('Charge succeeded (backup handler)', { 
    chargeId: charge.id, 
    paymentIntentId 
  });

  // Check if booking already has succeeded status
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('payment_status')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  // Only update if not already succeeded
  if (existingBooking && existingBooking.payment_status !== 'succeeded') {
    await supabase
      .from('bookings')
      .update({ 
        payment_status: 'succeeded', 
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId);
    
    logStep('Booking updated via charge.succeeded');
  }
}

async function handlePaymentFailed(event: any, supabase: any) {
  const paymentIntent = event.data.object;
  const bookingId = paymentIntent.metadata?.booking_id;
  const failureCode = paymentIntent.last_payment_error?.code;
  const failureMessage = paymentIntent.last_payment_error?.message;
  
  logStep('Payment failed', { 
    paymentIntentId: paymentIntent.id,
    bookingId,
    code: failureCode,
    message: failureMessage 
  });

  if (!bookingId) {
    logStep('No booking_id in metadata, skipping');
    return;
  }

  // Update booking with failure details
  const { error } = await supabase
    .from('bookings')
    .update({ 
      payment_status: 'failed',
      status: 'cancelled',
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) {
    logStep('Error updating booking', { error });
    return;
  }

  // Send email notification to hiker
  const { data: booking } = await supabase
    .from('bookings')
    .select('hiker_id, tour_id, hiker_email, profiles!bookings_hiker_id_fkey(name)')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (booking) {
    const errorMessage = getUserFriendlyErrorMessage(failureCode);
    await supabase.functions.invoke('send-email', {
      body: {
        to: booking.hiker_email,
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
  if (account.charges_enabled && account.details_submitted && account.payouts_enabled) {
    kycStatus = 'verified';
  } else if (account.requirements?.currently_due?.length > 0) {
    kycStatus = 'incomplete';
  } else if (account.requirements?.disabled_reason) {
    kycStatus = 'failed';
  }

  // Extract bank account info if available
  let bankAccountLast4 = null;
  if (account.external_accounts?.data?.length > 0) {
    const bankAccount = account.external_accounts.data[0];
    bankAccountLast4 = bankAccount.last4;
  }

  // Store comprehensive requirements data
  const requirementsData = account.requirements ? {
    currently_due: account.requirements.currently_due || [],
    eventually_due: account.requirements.eventually_due || [],
    past_due: account.requirements.past_due || [],
    pending_verification: account.requirements.pending_verification || [],
    disabled_reason: account.requirements.disabled_reason || null,
    errors: account.requirements.errors || [],
    current_deadline: account.requirements.current_deadline || null,
  } : {};

  await supabase
    .from('guide_profiles')
    .update({ 
      stripe_kyc_status: kycStatus,
      bank_account_last4: bankAccountLast4,
      stripe_requirements: requirementsData,
    })
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
  
  // Send email notification to guide
  const { data: guide } = await supabase
    .from('guide_profiles')
    .select('user_id, display_name, profiles!guide_profiles_user_id_fkey(email)')
    .eq('stripe_account_id', payout.destination)
    .single();

  if (guide) {
    await supabase.functions.invoke('send-email', {
      body: {
        to: guide.profiles?.email,
        subject: 'Payout Failed - Action Required',
        template: 'payout_failed',
        data: {
          guideName: guide.display_name,
          amount: (payout.amount / 100).toFixed(2),
          currency: payout.currency.toUpperCase(),
          failureMessage: payout.failure_message || 'Unknown error',
          payoutId: payout.id,
        },
      },
    });
  }
}

async function handleTransferFailed(event: any, supabase: any) {
  const transfer = event.data.object;
  logStep('Transfer failed', { transferId: transfer.id, failureMessage: transfer.failure_message });

  await supabase
    .from('stripe_transfers')
    .update({ 
      status: 'failed',
      retry_count: supabase.raw('retry_count + 1'),
      next_retry_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('stripe_transfer_id', transfer.id);
}

async function handleCapabilityUpdated(event: any, supabase: any) {
  const account = event.account;
  const capability = event.data.object;
  
  logStep('Capability updated', { 
    accountId: account,
    capability: capability.id,
    status: capability.status 
  });

  // Re-sync account status when capabilities change
  const accountData = await stripe.accounts.retrieve(account);
  
  let kycStatus = 'pending';
  if (accountData.charges_enabled && accountData.details_submitted && accountData.payouts_enabled) {
    kycStatus = 'verified';
  } else if (accountData.requirements?.currently_due?.length > 0) {
    kycStatus = 'incomplete';
  } else if (accountData.requirements?.disabled_reason) {
    kycStatus = 'failed';
  }

  await supabase
    .from('guide_profiles')
    .update({ stripe_kyc_status: kycStatus })
    .eq('stripe_account_id', account);
}
