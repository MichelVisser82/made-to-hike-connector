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
    const { amount, serviceFee, totalAmount, currency, tourId, tourTitle, bookingData, guideId, dateSlotId, isDeposit, depositAmount, finalPaymentAmount, hikerEmail } = await req.json();
    
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
      hikerEmail
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

    // Fetch platform fee settings
    const { data: platformSettings } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'platform_fees')
      .single();

    const defaultGuideFee = platformSettings?.setting_value?.guide_fee_percentage || 5;
    const defaultHikerFee = platformSettings?.setting_value?.hiker_fee_percentage || 10;

    // Apply custom fees if guide has them configured, otherwise use platform defaults
    const guideFee = guide.uses_custom_fees ? (guide.custom_guide_fee_percentage || defaultGuideFee) : defaultGuideFee;
    const hikerFee = guide.uses_custom_fees ? (guide.custom_hiker_fee_percentage || defaultHikerFee) : defaultHikerFee;
    
    console.log('[create-payment-intent] Fee structure:', {
      guideFee,
      hikerFee,
      usesCustomFees: guide.uses_custom_fees,
      guideId
    });
    
    // Calculate fees based on business rules:
    // - Guide fee: X% of POST-discounted price (what guide actually earns)
    // - Hiker fee: 10% of PRE-discounted price (original tour price)
    const amountCents = Math.round(amount * 100); // POST-discounted price
    const totalAmountCents = Math.round(totalAmount * 100); // Total to charge customer
    const preDiscountSubtotal = bookingData?.subtotal || amount; // PRE-discounted base price
    const preDiscountSubtotalCents = Math.round(preDiscountSubtotal * 100);
    
    // Guide fee on POST-discounted price (guide pays fee on what they actually earn after discounts)
    const guideFeeCents = Math.round(amountCents * (guideFee / 100));
    
    // Hiker fee on PRE-discounted price (hiker pays platform fee on original tour value)
    const hikerFeeCents = Math.round(preDiscountSubtotalCents * (hikerFee / 100));
    
    // Total platform revenue
    const platformRevenue = hikerFeeCents + guideFeeCents;
    
    console.log('[create-payment-intent] Fee calculation:', {
      preDiscountSubtotalCents,
      amountCents,
      guideFee: `${guideFee}%`,
      hikerFee: `${hikerFee}%`,
      guideFeeCents,
      hikerFeeCents,
      platformRevenue,
      amountToGuide: amountCents - guideFeeCents
    });

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
          // ESCROW MODEL: Funds stay on platform account until tour completion
          // No application_fee_amount or transfer_data - full amount captured to platform
          // Transfer to guide created by process-tour-completion edge function after tour is marked complete
          setup_future_usage: isDeposit ? 'off_session' : undefined, // Save payment method for deposits
          metadata: {
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
          tour_id: tourId,
          guide_id: guideId,
          date_slot_id: dateSlotId || '',
          booking_data_key: sessionKey, // Store reference to booking data
          participant_count: String(bookingData?.participantCount || 1),
          guide_fee_percentage: String(guideFee),
          hiker_fee_percentage: String(hikerFee),
          hiker_service_fee_amount: String(hikerFeeCents),
          guide_fee_amount: String(guideFeeCents),
          platform_revenue: String(platformRevenue),
          amount_to_guide: String(amountCents - guideFeeCents),
          pre_discount_subtotal: String(preDiscountSubtotalCents),
          tour_price_after_discount: String(amountCents),
          uses_custom_fees: String(guide.uses_custom_fees || false),
          is_deposit: String(isDeposit || false),
          deposit_amount: String(isDeposit ? Math.round((depositAmount || 0) * 100) : 0),
          final_payment_amount: String(isDeposit ? Math.round((finalPaymentAmount || 0) * 100) : 0),
          final_payment_days: String(bookingData?.finalPaymentDays || 0),
        },
      };

      // ESCROW MODEL: No on_behalf_of needed - funds captured directly to platform account
      // Guide receives payment after tour completion via transfer

      // Stripe automatically filters payment methods based on setup_future_usage
      // No need to manually restrict payment_method_types

      session = await stripe.checkout.sessions.create(sessionConfig);

      // Send Facebook CAPI InitiateCheckout event
      try {
        await supabase.functions.invoke('facebook-capi', {
          body: {
            eventName: 'InitiateCheckout',
            eventSourceUrl: `https://madetohike.com/tours/${tourId}/book`,
            userData: {
              email: hikerEmail,
            },
            customData: {
              value: totalAmount,
              currency: currency.toUpperCase(),
              contentIds: [tourId],
              contentName: tourTitle,
              contentType: 'product',
              numItems: bookingData?.participantCount || 1,
            },
          },
        });
        console.log('[create-payment-intent] Facebook CAPI InitiateCheckout event sent');
      } catch (capiError) {
        console.warn('[create-payment-intent] Facebook CAPI error (non-blocking):', capiError);
      }
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
