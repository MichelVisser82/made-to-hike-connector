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
    const { amount, serviceFee, totalAmount, currency, tourId, tourTitle, bookingData, guideId, dateSlotId, isDeposit, depositAmount, finalPaymentAmount } = await req.json();
    
    console.log('[create-payment-intent] Request received:', { 
      amount, 
      serviceFee, 
      totalAmount, 
      currency, 
      tourId, 
      guideId, 
      dateSlotId, 
      isDeposit, 
      depositAmount, 
      finalPaymentAmount 
    });

    if (!amount || !serviceFee || !totalAmount || !currency || !tourId || !guideId) {
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
    
    // Use the pre-calculated service fee from frontend (which was calculated on original price before discount)
    const amountCents = Math.round(amount * 100); // Tour price after discount
    const serviceFeeCents = Math.round(serviceFee * 100); // Pre-calculated service fee
    const totalAmountCents = Math.round(totalAmount * 100); // Total to charge customer
    
    // Calculate guide's portion of the service fee
    const guideFeeCents = Math.round(amountCents * (guideFee / 100));
    
    // Platform takes service fee + guide fee, guide receives amount - guide fee
    const totalFee = serviceFeeCents + guideFeeCents;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    let session;
    try {
      // Store booking data in KV store temporarily (expires in 1 hour)
      const sessionKey = `booking_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      await supabase
        .from('kv_store')
        .insert({
          key: sessionKey,
          value: bookingData,
          expires_at: expiresAt.toISOString()
        });

      session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: tourTitle || 'Hiking Tour',
              description: isDeposit 
                ? `Deposit payment - ${bookingData?.participantCount || 1} participant(s)` 
                : `Full payment - ${bookingData?.participantCount || 1} participant(s)`,
            },
            unit_amount: totalAmountCents, // Charge the total amount (deposit/full + service fee)
          },
          quantity: 1,
        }],
        mode: 'payment',
        payment_intent_data: {
          application_fee_amount: totalFee, // Platform takes service fee + guide fee
          transfer_data: {
            destination: guide.stripe_account_id, // Guide receives amount - guide fee
          },
          setup_future_usage: isDeposit ? 'off_session' : undefined, // Save payment method for final payment if deposit
        },
        success_url: `${req.headers.get('origin')}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/tours/${tourId}/book`,
        metadata: {
          tour_id: tourId,
          guide_id: guideId,
          date_slot_id: dateSlotId || '',
          booking_data_key: sessionKey, // Store reference to booking data
          participant_count: String(bookingData?.participantCount || 1),
          guide_fee_percentage: String(guideFee),
          service_fee_amount: String(serviceFeeCents),
          guide_fee_amount: String(guideFeeCents),
          total_platform_fee: String(totalFee),
          amount_to_guide: String(amountCents - guideFeeCents),
          tour_price_after_discount: String(amountCents),
          is_deposit: String(isDeposit || false),
          deposit_amount: String(isDeposit ? Math.round((depositAmount || 0) * 100) : 0),
          final_payment_amount: String(isDeposit ? Math.round((finalPaymentAmount || 0) * 100) : 0),
          final_payment_days: String(bookingData?.finalPaymentDays || 0),
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
