import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { corsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  console.log(`[ACCEPT-OFFER] ${step}`, details || '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token } = await req.json();
    
    if (!token) {
      throw new Error('Token is required');
    }

    logStep("Fetching offer", { token });

    // Fetch offer
    const { data: offer, error: offerError } = await supabase
      .from('tour_offers')
      .select('*')
      .eq('offer_token', token)
      .single();

    if (offerError || !offer) {
      logStep("Offer fetch error", { offerError });
      throw new Error('Offer not found');
    }

    // Fetch guide's Stripe account separately
    const { data: guideProfile, error: guideError } = await supabase
      .from('guide_profiles')
      .select('stripe_account_id')
      .eq('user_id', offer.guide_id)
      .single();

    if (guideError || !guideProfile) {
      logStep("Guide profile fetch error", { guideError });
      throw new Error('Guide profile not found');
    }

    logStep("Guide Stripe account", { stripe_account_id: guideProfile.stripe_account_id });

    // Check offer is still pending
    if (offer.offer_status !== 'pending') {
      throw new Error(`Offer is ${offer.offer_status}`);
    }

    // Check expiration
    if (new Date(offer.expires_at) < new Date()) {
      await supabase
        .from('tour_offers')
        .update({ offer_status: 'expired' })
        .eq('id', offer.id);
      throw new Error('Offer has expired');
    }

    logStep("Offer valid, creating Stripe session");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check guide has Stripe account
    if (!guideProfile.stripe_account_id) {
      throw new Error('Guide does not have a Stripe account configured');
    }

    // Calculate platform fee (5% default)
    const platformFeePercent = 5;
    const platformFeeAmount = Math.round((offer.total_price * platformFeePercent) / 100 * 100);
    const guideAmount = Math.round(offer.total_price * 100) - platformFeeAmount;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: offer.currency.toLowerCase(),
            product_data: {
              name: `Custom Tour - ${offer.duration}`,
              description: `Tour for ${offer.group_size} ${offer.group_size === 1 ? 'person' : 'people'}`,
            },
            unit_amount: Math.round(offer.total_price * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: guideProfile.stripe_account_id,
        },
        metadata: {
          offer_id: offer.id,
          conversation_id: offer.conversation_id,
          guide_id: offer.guide_id,
          hiker_email: offer.hiker_email,
        },
      },
      customer_email: offer.hiker_email,
      metadata: {
        offer_id: offer.id,
        conversation_id: offer.conversation_id,
        type: 'tour_offer',
      },
      success_url: `${req.headers.get("origin")}/booking-success?offer_id=${offer.id}`,
      cancel_url: `${req.headers.get("origin")}/offer/decline?token=${token}`,
    });

    logStep("Stripe session created", { session_id: session.id });

    // Update offer status
    await supabase
      .from('tour_offers')
      .update({ offer_status: 'payment_pending' })
      .eq('id', offer.id);

    return new Response(JSON.stringify({ url: session.url }), {
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
