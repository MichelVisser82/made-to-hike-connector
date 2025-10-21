import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
    const { amount, currency, tourId, tourTitle, bookingData, guideId, dateSlotId } = await req.json();
    
    console.log('Creating Stripe Checkout Session:', { amount, currency, tourId, bookingData });

    if (!amount || !currency || !tourId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const origin = req.headers.get('origin') || 'http://localhost:8080';
    
    // Prepare metadata
    const participantsString = typeof bookingData?.participants === 'string' 
      ? bookingData.participants 
      : JSON.stringify(bookingData?.participants || []);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: tourTitle || 'Hiking Tour',
              description: `${bookingData?.participantCount || 1} participant(s)`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tours/${tourId}/book`,
      metadata: {
        tour_id: tourId,
        guide_id: guideId || '',
        date_slot_id: dateSlotId || '',
        tour_title: tourTitle || '',
        participants: participantsString,
        participant_count: String(bookingData?.participantCount || 1),
        booking_data: JSON.stringify(bookingData),
      },
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create payment intent' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
