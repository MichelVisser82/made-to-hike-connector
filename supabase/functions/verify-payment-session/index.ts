import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
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

    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error('session_id is required');
    }

    logStep('Retrieving Stripe session', { sessionId: session_id });

    // Retrieve the checkout session with expanded payment intent to check payment method
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent']
    });

    logStep('Session retrieved', { 
      paymentStatus: session.payment_status,
      paymentIntentId: session.payment_intent,
      sessionStatus: session.status
    });

    // Check if session expired
    if (session.status === 'expired') {
      logStep('Session expired', { sessionId: session_id, expiresAt: session.expires_at });
      return new Response(
        JSON.stringify({ 
          error: 'Payment session expired. Please start a new booking.',
          expired: true
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For SEPA and other delayed payment methods, payment_status will be 'unpaid' initially
    // but the session is valid and the payment is processing
    // We need to check if the session is complete and the payment intent exists
    const isValidPayment = session.payment_status === 'paid' || 
      (session.status === 'complete' && session.payment_intent);

    if (!isValidPayment) {
      logStep('Invalid payment status', {
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
        hasPaymentIntent: !!session.payment_intent
      });
      throw new Error('Payment not completed');
    }

    // Determine the actual payment status for the booking
    let bookingPaymentStatus = 'paid';
    if (session.payment_status === 'unpaid' && session.payment_intent) {
      // For SEPA and similar methods, mark as processing
      const paymentIntent = session.payment_intent as any;
      if (paymentIntent.status === 'processing' || paymentIntent.status === 'requires_action') {
        bookingPaymentStatus = 'processing';
      }
    }

    logStep('Session verified', { 
      paymentStatus: session.payment_status,
      bookingPaymentStatus,
      paymentIntentId: session.payment_intent 
    });

    // Retrieve booking data from KV store using the key from metadata
    let bookingData = null;
    if (session.metadata?.booking_data_key) {
      try {
        const { data: kvData } = await supabaseClient
          .from('kv_store')
          .select('value')
          .eq('key', session.metadata.booking_data_key)
          .single();
        
        if (kvData?.value) {
          bookingData = kvData.value;
          // Add metadata fields to booking data
          bookingData.tour_id = session.metadata.tour_id;
          bookingData.date_slot_id = session.metadata.date_slot_id;
          logStep('Booking data retrieved from KV store', { 
            tourId: bookingData.tour_id,
            dateSlotId: bookingData.date_slot_id 
          });
          
          // Clean up the KV store entry
          await supabaseClient
            .from('kv_store')
            .delete()
            .eq('key', session.metadata.booking_data_key);
        }
      } catch (kvError) {
        logStep('Error retrieving booking data from KV store', { error: kvError });
      }
    }

    // Return payment verification success with booking data
    return new Response(
      JSON.stringify({ 
        success: true,
        paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
        sessionId: session_id,
        amountPaid: session.amount_total / 100,
        currency: session.currency,
        paymentStatus: bookingPaymentStatus,
        bookingData: bookingData
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
