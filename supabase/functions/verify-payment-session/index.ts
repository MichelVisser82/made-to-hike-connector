import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
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

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    logStep('Session verified', { 
      paymentStatus: session.payment_status,
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
        paymentIntentId: session.payment_intent,
        sessionId: session_id,
        amountPaid: session.amount_total / 100,
        currency: session.currency,
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
