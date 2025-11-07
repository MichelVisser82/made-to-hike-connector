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

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { amount, currency, tourId, tourTitle, bookingData, guideId, dateSlotId } = await req.json();
    
    console.log('Creating Stripe Checkout Session:', { amount, currency, tourId, bookingData });

    if (!amount || !currency || !tourId || !guideId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch guide's Stripe account and fee structure
    const { data: guideProfile, error: guideError } = await supabaseClient
      .from('guide_profiles')
      .select('stripe_account_id, uses_custom_fees, custom_guide_fee_percentage, custom_hiker_fee_percentage')
      .eq('id', guideId)
      .single();

    if (guideError || !guideProfile?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Guide Stripe account not found or not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch platform fee settings
    const { data: platformSettings } = await supabaseClient
      .from('platform_settings')
      .select('default_guide_fee_percentage, default_hiker_fee_percentage')
      .single();

    // Determine fees to use
    const guideFeePercentage = guideProfile.uses_custom_fees 
      ? (guideProfile.custom_guide_fee_percentage || 5)
      : (platformSettings?.default_guide_fee_percentage || 5);
    
    const hikerFeePercentage = guideProfile.uses_custom_fees
      ? (guideProfile.custom_hiker_fee_percentage || 10)
      : (platformSettings?.default_hiker_fee_percentage || 10);

    // Calculate fees
    const totalAmountCents = Math.round(amount * 100);
    const hikerFeeAmount = Math.round(totalAmountCents * (hikerFeePercentage / 100));
    const guideFeeAmount = Math.round(totalAmountCents * (guideFeePercentage / 100));
    const totalPlatformFee = hikerFeeAmount + guideFeeAmount;
    const guideReceives = totalAmountCents - guideFeeAmount;

    console.log('Fee calculation:', {
      totalAmountCents,
      guideFeePercentage,
      hikerFeePercentage,
      guideFeeAmount,
      hikerFeeAmount,
      totalPlatformFee,
      guideReceives,
    });

    const origin = req.headers.get('origin') || 'http://localhost:8080';
    
    // Prepare metadata
    const participantsString = typeof bookingData?.participants === 'string' 
      ? bookingData.participants 
      : JSON.stringify(bookingData?.participants || []);

    // Create Stripe Checkout Session with split payment
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
            unit_amount: totalAmountCents + hikerFeeAmount, // Total charged to hiker
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: totalPlatformFee,
        transfer_data: {
          destination: guideProfile.stripe_account_id,
        },
      },
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tours/${tourId}/book`,
      metadata: {
        tour_id: tourId,
        guide_id: guideId,
        date_slot_id: dateSlotId || '',
        tour_title: tourTitle || '',
        participants: participantsString,
        participant_count: String(bookingData?.participantCount || 1),
        booking_data: JSON.stringify(bookingData),
        guide_fee_percentage: String(guideFeePercentage),
        hiker_fee_percentage: String(hikerFeePercentage),
        guide_fee_amount: String(guideFeeAmount),
        hiker_fee_amount: String(hikerFeeAmount),
        total_platform_fee: String(totalPlatformFee),
        amount_to_guide: String(guideReceives),
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
