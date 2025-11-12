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
    const { amount, serviceFee, totalAmount, currency, tourId, tourTitle, bookingData, guideId, dateSlotId, isDeposit, depositAmount, finalPaymentAmount, hikerEmail, bookingId } = await req.json();
    
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
      finalPaymentAmount,
      hikerEmail,
      bookingId
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
      .select('stripe_account_id, uses_custom_fees, custom_guide_fee_percentage, custom_hiker_fee_percentage, deposit_type, deposit_amount, final_payment_days')
      .eq('user_id', guideId)
      .single();

    if (guideError || !guide?.stripe_account_id) {
      console.error('[create-payment-intent] Guide not found or missing Stripe account:', guideError);
      return new Response(
        JSON.stringify({ error: 'Guide payment setup incomplete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate deposit payment is allowed based on tour date
    if (isDeposit && dateSlotId) {
      const { data: dateSlot } = await supabase
        .from('tour_date_slots')
        .select('slot_date')
        .eq('id', dateSlotId)
        .single();
      
      if (dateSlot) {
        const finalPaymentDays = guide.final_payment_days || 14;
        const tourDate = new Date(dateSlot.slot_date);
        const now = new Date();
        const daysUntilTour = Math.ceil((tourDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilTour <= finalPaymentDays) {
          console.error('[create-payment-intent] Tour is within final payment deadline, deposit not allowed');
          return new Response(
            JSON.stringify({ 
              error: `Tour is within ${finalPaymentDays} day payment deadline. Full payment required.`,
              requiresFullPayment: true
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
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

    // Check if customer exists in Stripe, otherwise create one to ensure payment method is saved
    let customerId: string | undefined;
    if (hikerEmail) {
      try {
        const customers = await stripe.customers.list({ email: hikerEmail, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          console.log('[create-payment-intent] Found existing Stripe customer:', customerId);
        } else if (isDeposit) {
          // Create customer for deposits to ensure payment method can be saved
          const newCustomer = await stripe.customers.create({
            email: hikerEmail,
            metadata: {
              booking_id: bookingId || '',
              tour_id: tourId,
            }
          });
          customerId = newCustomer.id;
          console.log('[create-payment-intent] Created new Stripe customer for deposit:', customerId);
        }
      } catch (customerError) {
        console.warn('[create-payment-intent] Could not check/create customer:', customerError);
      }
    }

    // Verify guide's Stripe account is ready for payments
    try {
      const account = await stripe.accounts.retrieve(guide.stripe_account_id);
      
      console.log('[create-payment-intent] Guide account status:', {
        accountId: guide.stripe_account_id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      });
      
      if (!account.charges_enabled) {
        return new Response(
          JSON.stringify({ 
            error: 'Guide account is not ready to receive payments. The guide needs to complete their Stripe onboarding.',
            accountStatus: 'not_ready'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check for transfer capabilities
      if (account.capabilities?.transfers !== 'active') {
        console.warn('[create-payment-intent] Transfer capability not active:', account.capabilities);
      }
      
    } catch (accountError) {
      console.error('[create-payment-intent] Failed to verify guide account:', accountError);
      return new Response(
        JSON.stringify({ 
          error: 'Unable to verify guide payment setup. Please contact support.',
          details: accountError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let session;
    try {
      // Store booking data in KV store temporarily (expires in 1 hour)
      const sessionKey = `booking_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      const { error: kvError } = await supabase
        .from('kv_store')
        .insert({
          key: sessionKey,
          value: bookingData,
          expires_at: expiresAt.toISOString()
        });
      
      if (kvError) {
        console.error('[create-payment-intent] Failed to store booking data:', kvError);
        return new Response(
          JSON.stringify({ error: 'Failed to prepare booking session. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // For deposits, only allow payment methods that support saving for future use
      // For full payments, allow all available payment methods
      const sessionConfig: any = {
        customer: customerId,
        customer_email: customerId ? undefined : hikerEmail, // Auto-populate email if no customer exists
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
          customer: customerId, // Attach customer to payment intent for saving payment methods
          transfer_data: {
            destination: guide.stripe_account_id, // Guide receives amount - guide fee
          },
          setup_future_usage: isDeposit ? 'off_session' : undefined, // Save payment method for deposits
          metadata: {
            booking_id: bookingId || '',
            tour_id: tourId,
            guide_id: guideId,
            date_slot_id: dateSlotId || '',
            is_deposit: String(isDeposit || false),
            tour_price: String(amountCents),
          },
        },
        success_url: `${req.headers.get('origin')}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/tours/${tourId}/book`,
        metadata: {
          booking_id: bookingId || '',
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
      };

      // Add on_behalf_of for platform fee transparency
      if (guide.stripe_account_id) {
        sessionConfig.payment_intent_data.on_behalf_of = guide.stripe_account_id;
      }

      // Stripe automatically filters payment methods based on setup_future_usage
      // No need to manually restrict payment_method_types

      session = await stripe.checkout.sessions.create(sessionConfig);
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
    console.log('[create-payment-intent] About to return response:', { 
      sessionId: session.id, 
      url: session.url,
      hasUrl: !!session.url 
    });

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
