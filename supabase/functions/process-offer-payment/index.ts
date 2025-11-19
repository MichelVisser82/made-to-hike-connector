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
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    logStep("Event verified", { type: event.type });

    // Only process checkout.session.completed for offers
    if (event.type !== 'checkout.session.completed') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = event.data.object as any;
    const offerId = session.metadata?.offer_id;
    const type = session.metadata?.type;

    if (type !== 'tour_offer' || !offerId) {
      logStep("Not an offer payment, skipping");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Processing offer payment", { offer_id: offerId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch offer details
    const { data: offer, error: offerError } = await supabase
      .from('tour_offers')
      .select('*')
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      throw new Error('Offer not found');
    }

    // Fetch or create hiker profile
    let hikerId = offer.hiker_id;
    if (!hikerId) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', offer.hiker_email)
        .single();

      hikerId = existingProfile?.id;
    }

    // Create booking
    const bookingReference = `MTH-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        hiker_id: hikerId || offer.hiker_id,
        hiker_email: offer.hiker_email,
        tour_id: null, // Custom offer, no regular tour
        booking_date: offer.preferred_date,
        participants: offer.group_size,
        total_price: offer.total_price,
        currency: offer.currency,
        payment_status: 'succeeded',
        payment_type: 'full',
        status: 'confirmed',
        booking_reference: bookingReference,
        stripe_payment_intent_id: session.payment_intent,
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
      .eq('id', offerId);

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

    // TODO: Send confirmation emails
    // This can be added later

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logStep("ERROR", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
