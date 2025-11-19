import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { corsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  console.log(`[PROCESS-OFFER-PAYMENT] ${step}`, details || '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function invoked");

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // This function is called internally from the main stripe-webhook handler
    // via supabase.functions.invoke, so we don't verify the Stripe signature here.
    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error('session_id is required');
    }

    logStep("Retrieving checkout session", { session_id });

    const session = await stripe.checkout.sessions.retrieve(session_id as string, {
      expand: ['payment_intent'],
    });

    logStep("Session retrieved", {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });

    const offerId = session.metadata?.offer_id;
    const type = session.metadata?.type;

    if (type !== 'tour_offer' || !offerId) {
      logStep("Not an offer payment, skipping", { type, offerId });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (session.payment_status !== 'paid') {
      logStep("Payment not completed, skipping", {
        payment_status: session.payment_status,
      });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Processing offer payment", { offer_id: offerId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if a booking already exists for this payment intent (idempotency)
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id, booking_reference')
      .eq('stripe_payment_intent_id', session.payment_intent as string)
      .maybeSingle();

    if (existingBooking) {
      logStep("Booking already exists, skipping creation", {
        booking_id: existingBooking.id,
      });
      return new Response(
        JSON.stringify({
          received: true,
          booking: existingBooking,
          message: 'Booking already created',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch offer details
    const { data: offer, error: offerError } = await supabase
      .from('tour_offers')
      .select('*')
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      throw new Error('Offer not found');
    }

    // Fetch or get hiker profile
    let hikerId = offer.hiker_id;
    if (!hikerId) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', offer.hiker_email)
        .maybeSingle();

      hikerId = existingProfile?.id;
    }

    // Create booking
    const bookingReference = `MTH-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        hiker_id: hikerId || offer.hiker_id,
        hiker_email: offer.hiker_email,
        tour_id: offer.tour_id, // Use tour from custom offer
        booking_date: offer.preferred_date,
        participants: offer.group_size,
        total_price: offer.total_price,
        currency: offer.currency,
        payment_status: 'succeeded',
        payment_type: 'full',
        status: 'confirmed',
        booking_reference: bookingReference,
        stripe_payment_intent_id: session.payment_intent as string,
        special_requests: `Custom tour offer: ${offer.itinerary}`,
      })
      .select()
      .single();

    if (bookingError) {
      logStep("Booking creation error", bookingError);
      throw bookingError;
    }

    logStep("Booking created", { booking_id: booking.id });

    // Update offer
    await supabase
      .from('tour_offers')
      .update({
        offer_status: 'accepted',
        accepted_at: new Date().toISOString(),
        booking_id: booking.id,
      })
      .eq('id', offerId as string);

    // Create system message
    await supabase.from('messages').insert({
      conversation_id: offer.conversation_id,
      sender_id: offer.guide_id,
      sender_type: 'system',
      content: `Offer accepted! Booking ${bookingReference} confirmed. Payment received: €${offer.total_price}`,
      message_type: 'system',
      is_automated: true,
    });

    logStep("Process completed successfully");

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logStep("ERROR", error?.message || error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
