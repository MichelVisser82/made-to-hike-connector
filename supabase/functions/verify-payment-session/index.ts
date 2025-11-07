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

    // Find and update the booking
    const { data: booking, error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        payment_status: 'succeeded',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', session.payment_intent)
      .select('*, tours(title, duration), profiles!bookings_hiker_id_fkey(name, email)')
      .single();

    if (updateError) {
      logStep('Error updating booking', { error: updateError });
      throw updateError;
    }

    logStep('Booking confirmed', { bookingId: booking.id });

    return new Response(
      JSON.stringify({ 
        success: true,
        booking: booking
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
