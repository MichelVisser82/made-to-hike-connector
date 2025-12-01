import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-TOUR-COMPLETION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const { booking_id } = await req.json();

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'booking_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Processing tour completion transfer', { booking_id });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch booking details with all payment information
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        tours!inner(
          guide_id,
          title,
          guide_profiles!tours_guide_id_fkey(
            stripe_account_id,
            custom_guide_fee_percentage,
            uses_custom_fees
          )
        )
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      logStep('Booking not found', { error: bookingError });
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Booking found', { 
      booking_reference: booking.booking_reference,
      status: booking.status,
      escrow_enabled: booking.escrow_enabled,
      transfer_status: booking.transfer_status
    });

    // Validation checks
    if (!booking.escrow_enabled) {
      logStep('Booking uses legacy immediate transfer, skipping');
      return new Response(
        JSON.stringify({ 
          error: 'This booking uses legacy payment model (immediate transfer). No escrow transfer needed.',
          legacy_booking: true
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.status !== 'completed') {
      logStep('Tour not completed', { status: booking.status });
      return new Response(
        JSON.stringify({ error: 'Tour must be marked as completed before transferring funds to guide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.transfer_status === 'succeeded') {
      logStep('Transfer already completed', { transfer_id: booking.stripe_transfer_id });
      return new Response(
        JSON.stringify({ 
          error: 'Transfer already completed',
          transfer_id: booking.stripe_transfer_id 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.payment_status !== 'succeeded') {
      logStep('Payment not succeeded', { payment_status: booking.payment_status });
      return new Response(
        JSON.stringify({ error: 'Payment must be succeeded before transferring to guide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const guideStripeAccountId = booking.tours.guide_profiles.stripe_account_id;
    if (!guideStripeAccountId) {
      logStep('Guide has no Stripe account');
      return new Response(
        JSON.stringify({ error: 'Guide has not connected their Stripe account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate transfer amount
    // Total amount paid includes: deposit + final payment (if applicable)
    let totalPaid = 0;
    
    // Initial payment amount
    if (booking.stripe_payment_intent_id) {
      const initialPayment = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
      totalPaid += initialPayment.amount;
      logStep('Initial payment', { amount: initialPayment.amount });
    }

    // Final payment amount (if applicable)
    if (booking.final_payment_intent_id) {
      const finalPayment = await stripe.paymentIntents.retrieve(booking.final_payment_intent_id);
      totalPaid += finalPayment.amount;
      logStep('Final payment', { amount: finalPayment.amount });
    }

    logStep('Total paid by hiker (in cents)', { totalPaid });

    // Fetch platform fee settings
    const { data: platformSettings } = await supabaseAdmin
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'platform_fees')
      .single();

    const defaultGuideFee = platformSettings?.setting_value?.guide_fee_percentage || 5;
    const defaultHikerFee = platformSettings?.setting_value?.hiker_fee_percentage || 10;

    // Use guide's custom fees if configured
    const guideFeePercentage = booking.tours.guide_profiles.uses_custom_fees && 
                                booking.tours.guide_profiles.custom_guide_fee_percentage
      ? booking.tours.guide_profiles.custom_guide_fee_percentage
      : defaultGuideFee;

    logStep('Fee configuration', { 
      guideFeePercentage,
      defaultGuideFee,
      usesCustomFees: booking.tours.guide_profiles.uses_custom_fees 
    });

    // Calculate amounts based on business rules:
    // - Guide fee: X% of POST-discounted price (what guide actually earns)
    // - Platform revenue: guide fee + hiker service fee
    const preDiscountSubtotal = booking.subtotal || 0;
    const discountAmount = booking.discount_amount || 0;
    const postDiscountAmount = preDiscountSubtotal - discountAmount;

    // Guide fee calculated on POST-DISCOUNTED amount
    const guideFeeAmount = Math.round((postDiscountAmount * guideFeePercentage) / 100);

    // Guide receives post-discounted amount minus their fee
    const transferAmount = postDiscountAmount - guideFeeAmount;

    // Platform revenue = guide fee + hiker service fee (already collected)
    const platformRevenue = guideFeeAmount + (booking.service_fee_amount || 0);

    logStep('Transfer calculation', {
      preDiscountSubtotal,
      discountAmount,
      postDiscountAmount,
      guideFeePercentage,
      guideFeeAmount,
      hikerServiceFee: booking.service_fee_amount,
      platformRevenue,
      transferAmount
    });

    // Convert to cents if not already
    const transferAmountInCents = Math.round(transferAmount * 100);

    // Verify guide's Stripe account is valid and can receive transfers
    try {
      const account = await stripe.accounts.retrieve(guideStripeAccountId);
      
      if (!account.charges_enabled) {
        logStep('Guide account cannot receive charges', { accountId: guideStripeAccountId });
        return new Response(
          JSON.stringify({ 
            error: 'Guide Stripe account is not enabled to receive funds. Guide must complete verification.',
            account_status: 'charges_disabled'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!account.payouts_enabled) {
        logStep('WARNING: Guide account payouts disabled but continuing with transfer', { accountId: guideStripeAccountId });
      }
    } catch (accountError) {
      logStep('Error checking guide account', { error: accountError });
      return new Response(
        JSON.stringify({ error: 'Failed to verify guide Stripe account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe Transfer to guide
    logStep('Creating Stripe transfer', {
      destination: guideStripeAccountId,
      amount: transferAmountInCents,
      currency: booking.currency
    });

    let transfer;
    try {
      transfer = await stripe.transfers.create({
        amount: transferAmountInCents,
        currency: booking.currency.toLowerCase(),
        destination: guideStripeAccountId,
        description: `Payment for ${booking.tours.title} - ${booking.booking_reference}`,
        metadata: {
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          tour_id: booking.tour_id,
          guide_id: booking.tours.guide_id,
          tour_title: booking.tours.title,
          booking_date: booking.booking_date,
          participants: booking.participants,
        },
        source_transaction: booking.stripe_payment_intent_id, // Link to original charge
      });

      logStep('Transfer created successfully', { 
        transferId: transfer.id,
        status: transfer.status,
        amount: transfer.amount
      });
    } catch (transferError: any) {
      logStep('Transfer creation failed', { error: transferError.message });
      
      // Update booking with failed transfer
      await supabaseAdmin
        .from('bookings')
        .update({
          transfer_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking_id);

      return new Response(
        JSON.stringify({ 
          error: 'Failed to create transfer to guide',
          details: transferError.message,
          transfer_failed: true
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking with transfer information
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        stripe_transfer_id: transfer.id,
        transfer_status: transfer.status === 'pending' ? 'pending' : 'succeeded',
        transfer_created_at: new Date().toISOString(),
        transfer_amount: transferAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id);

    if (updateError) {
      logStep('Failed to update booking', { error: updateError });
      // Transfer was created in Stripe but DB update failed - this will be reconciled by webhook
    }

    logStep('Tour completion transfer processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transfer.id,
        transfer_amount: transferAmount,
        currency: booking.currency,
        guide_stripe_account_id: guideStripeAccountId,
        booking_reference: booking.booking_reference,
        message: 'Transfer to guide created successfully. Funds will arrive in guide account within 1-2 business days.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('ERROR', { message: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
