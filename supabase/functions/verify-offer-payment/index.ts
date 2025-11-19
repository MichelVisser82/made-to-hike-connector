import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  console.log(`[VERIFY-OFFER-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error('session_id is required');
    }

    logStep("Retrieving checkout session", { session_id });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent'],
    });

    logStep("Session retrieved", { 
      status: session.status,
      payment_status: session.payment_status,
      metadata: session.metadata 
    });

    // Verify this is an offer payment
    if (session.metadata?.type !== 'tour_offer') {
      throw new Error('Not an offer payment session');
    }

    const offerId = session.metadata.offer_id;
    if (!offerId) {
      throw new Error('No offer_id in session metadata');
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    logStep("Payment verified as successful");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if booking already exists for this offer
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id, booking_reference')
      .eq('stripe_payment_intent_id', session.payment_intent)
      .single();

    if (existingBooking) {
      logStep("Booking already exists", { booking_id: existingBooking.id });
      return new Response(JSON.stringify({ 
        booking: existingBooking,
        message: 'Booking already created'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Fetch offer details
    const { data: offer, error: offerError } = await supabase
      .from('tour_offers')
      .select('*')
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      logStep("Offer fetch error", offerError);
      throw new Error('Offer not found');
    }

    logStep("Offer retrieved", { offer_id: offer.id, status: offer.offer_status });

    // Fetch or get hiker profile
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
    
    logStep("Creating booking", { booking_reference: bookingReference });

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

    logStep("Booking created successfully", { booking_id: booking.id });

    // Update offer status
    await supabase
      .from('tour_offers')
      .update({
        offer_status: 'accepted',
        accepted_at: new Date().toISOString(),
        booking_id: booking.id,
      })
      .eq('id', offerId);

    logStep("Offer updated to accepted");

    // Create system message in conversation
    await supabase.from('messages').insert({
      conversation_id: offer.conversation_id,
      sender_id: offer.guide_id,
      sender_type: 'system',
      content: `Offer accepted! Booking ${bookingReference} confirmed. Payment received: €${offer.total_price}`,
      message_type: 'system',
      is_automated: true,
    });

    logStep("System message created");

    // Send confirmation emails
    try {
      // Email to hiker
      await supabase.functions.invoke('send-email', {
        body: {
          to: offer.hiker_email,
          subject: 'Booking Confirmed - Custom Tour',
          html: `
            <h1>Your Custom Tour is Confirmed!</h1>
            <p>Great news! Your custom tour booking has been confirmed.</p>
            <h2>Booking Details</h2>
            <p><strong>Booking Reference:</strong> ${bookingReference}</p>
            <p><strong>Date:</strong> ${new Date(offer.preferred_date).toLocaleDateString()}</p>
            <p><strong>Group Size:</strong> ${offer.group_size} ${offer.group_size === 1 ? 'person' : 'people'}</p>
            <p><strong>Total Price:</strong> €${offer.total_price}</p>
            <h2>Tour Details</h2>
            <p><strong>Duration:</strong> ${offer.duration}</p>
            <p><strong>Itinerary:</strong> ${offer.itinerary}</p>
            <p><strong>Included:</strong> ${offer.included_items}</p>
            <p><strong>Meeting Point:</strong> ${offer.meeting_point}</p>
            <p><strong>Meeting Time:</strong> ${offer.meeting_time}</p>
            ${offer.personal_note ? `<p><strong>Guide's Note:</strong> ${offer.personal_note}</p>` : ''}
            <p>You can view your booking details in your <a href="https://madetohike.com/dashboard">dashboard</a>.</p>
            <p>We look forward to your adventure!</p>
          `
        }
      });

      // Email to guide
      const { data: guideProfile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', offer.guide_id)
        .single();

      if (guideProfile?.email) {
        await supabase.functions.invoke('send-email', {
          body: {
            to: guideProfile.email,
            subject: 'New Booking - Custom Tour Offer Accepted',
            html: `
              <h1>Your Custom Tour Offer Was Accepted!</h1>
              <p>Good news! Your custom tour offer has been accepted and paid for.</p>
              <h2>Booking Details</h2>
              <p><strong>Booking Reference:</strong> ${bookingReference}</p>
              <p><strong>Client:</strong> ${offer.hiker_email}</p>
              <p><strong>Date:</strong> ${new Date(offer.preferred_date).toLocaleDateString()}</p>
              <p><strong>Group Size:</strong> ${offer.group_size} ${offer.group_size === 1 ? 'person' : 'people'}</p>
              <p><strong>Total Price:</strong> €${offer.total_price}</p>
              <p>You can view the booking details in your <a href="https://madetohike.com/dashboard">dashboard</a>.</p>
            `
          }
        });
      }

      logStep("Confirmation emails sent");
    } catch (emailError) {
      logStep("Email sending failed (non-critical)", emailError);
      // Don't fail the whole process if emails fail
    }

    logStep("Process completed successfully");

    return new Response(JSON.stringify({ 
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        tour_title: 'Custom Tour',
        booking_date: booking.booking_date,
        participants: booking.participants,
        total_price: booking.total_price,
        currency: booking.currency
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
