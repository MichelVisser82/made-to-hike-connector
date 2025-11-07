import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, tourId, tourTitle, bookingData, guideId, dateSlotId } = await req.json();
    
    console.log('[create-payment-intent] Request received:', { amount, currency, tourId, guideId, dateSlotId });

    if (!amount || !currency || !tourId || !guideId) {
      console.error('[create-payment-intent] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required payment information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: guide, error: guideError } = await supabase
      .from('guide_profiles')
      .select('stripe_account_id, uses_custom_fees, custom_guide_fee_percentage, custom_hiker_fee_percentage')
      .eq('user_id', guideId)
      .single();

    if (guideError || !guide?.stripe_account_id) {
      console.error('[create-payment-intent] Guide not found or missing Stripe account:', guideError);
      return new Response(
        JSON.stringify({ error: 'Guide payment setup incomplete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: settings } = await supabase
      .from('platform_settings')
      .select('default_guide_fee_percentage, default_hiker_fee_percentage')
      .single();

    const guideFee = guide.uses_custom_fees ? (guide.custom_guide_fee_percentage || 5) : (settings?.default_guide_fee_percentage || 5);
    const hikerFee = guide.uses_custom_fees ? (guide.custom_hiker_fee_percentage || 10) : (settings?.default_hiker_fee_percentage || 10);

    const amountCents = Math.round(amount * 100);
    const hikerFeeCents = Math.round(amountCents * (hikerFee / 100));
    const guideFeeCents = Math.round(amountCents * (guideFee / 100));
    const totalFee = hikerFeeCents + guideFeeCents;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'sepa_debit', 'ideal', 'bancontact', 'giropay', 'sofort', 'eps', 'p24'],
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: tourTitle || 'Hiking Tour',
              description: `${bookingData?.participantCount || 1} participant(s)`,
            },
            unit_amount: amountCents + hikerFeeCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        payment_intent_data: {
          application_fee_amount: totalFee,
          transfer_data: {
            destination: guide.stripe_account_id,
          },
        },
        success_url: `${req.headers.get('origin')}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/tours/${tourId}/book`,
        metadata: {
          tour_id: tourId,
          guide_id: guideId,
          date_slot_id: dateSlotId || '',
          tour_title: tourTitle || '',
          participants: JSON.stringify(bookingData?.participants || []),
          participant_count: String(bookingData?.participantCount || 1),
          booking_data: JSON.stringify(bookingData),
          guide_fee_percentage: String(guideFee),
          hiker_fee_percentage: String(hikerFee),
          guide_fee_amount: String(guideFeeCents),
          hiker_fee_amount: String(hikerFeeCents),
          total_platform_fee: String(totalFee),
          amount_to_guide: String(amountCents - guideFeeCents),
        },
      });
    } catch (stripeError: any) {
      console.error('[create-payment-intent] Stripe error:', stripeError);
      
      if (stripeError.code === 'transfers_not_allowed') {
        return new Response(
          JSON.stringify({ 
            error: 'Payment region mismatch. In test mode, the platform and guide must be in the same Stripe region. In production, cross-border payments work automatically. Contact support if this persists.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (stripeError.code === 'account_invalid') {
        return new Response(
          JSON.stringify({ 
            error: 'Guide payment setup incomplete. The guide needs to complete their Stripe onboarding to accept payments.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: stripeError.message || 'Payment processing failed',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[create-payment-intent] Session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[create-payment-intent] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Payment failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
