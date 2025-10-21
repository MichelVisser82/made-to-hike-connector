import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    console.log('Verifying payment session:', sessionId);

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing session ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('Session retrieved:', { 
      id: session.id, 
      payment_status: session.payment_status,
      status: session.status 
    });

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the booking data from metadata
    const metadata = session.metadata || {};
    const bookingDataStr = metadata.booking_data;
    
    if (!bookingDataStr) {
      return new Response(
        JSON.stringify({ error: 'Missing booking data in session' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bookingData = JSON.parse(bookingDataStr);
    
    // Return the validated booking data
    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: session.payment_intent,
        amountPaid: session.amount_total / 100, // Convert from cents
        currency: session.currency?.toUpperCase(),
        bookingData: {
          tour_id: metadata.tour_id,
          guide_id: metadata.guide_id,
          date_slot_id: metadata.date_slot_id,
          participants: JSON.parse(metadata.participants || '[]'),
          participant_count: parseInt(metadata.participant_count || '1'),
          total_price: session.amount_total / 100,
          currency: session.currency?.toUpperCase(),
          payment_status: 'paid',
          payment_intent_id: session.payment_intent,
          ...bookingData
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying payment session:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to verify payment session' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
