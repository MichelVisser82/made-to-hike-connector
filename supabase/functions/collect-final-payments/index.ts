import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COLLECT-FINAL-PAYMENTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting final payment collection job');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Find bookings with final payments due today or overdue
    const today = new Date().toISOString().split('T')[0];
    
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        stripe_payment_intent_id,
        final_payment_amount,
        final_payment_due_date,
        final_payment_status,
        tour_id,
        hiker_id,
        guide_id,
        tours (
          title,
          guide_id,
          currency
        )
      `)
      .eq('payment_type', 'deposit')
      .eq('final_payment_status', 'pending')
      .lte('final_payment_due_date', today)
      .eq('status', 'confirmed');

    if (fetchError) {
      logStep('ERROR fetching bookings', { error: fetchError });
      throw fetchError;
    }

    logStep('Found bookings needing final payment', { count: bookings?.length || 0 });

    let successCount = 0;
    let failureCount = 0;

    for (const booking of bookings || []) {
      try {
        logStep('Processing booking', { booking_reference: booking.booking_reference });

        // Get the original payment intent to retrieve the payment method
        const originalPaymentIntent = await stripe.paymentIntents.retrieve(
          booking.stripe_payment_intent_id
        );

        if (!originalPaymentIntent.payment_method) {
          logStep('No payment method found', { booking_reference: booking.booking_reference });
          
          // Update booking to require manual payment
          await supabase
            .from('bookings')
            .update({
              final_payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', booking.id);
          
          failureCount++;
          continue;
        }

        // Get guide's Stripe account
        const { data: guide } = await supabase
          .from('guide_profiles')
          .select('stripe_account_id, uses_custom_fees, custom_guide_fee_percentage, custom_hiker_fee_percentage')
          .eq('user_id', booking.guide_id)
          .single();

        if (!guide?.stripe_account_id) {
          logStep('Guide missing Stripe account', { booking_reference: booking.booking_reference });
          failureCount++;
          continue;
        }

        // Get platform fee settings
        const { data: settings } = await supabase
          .from('platform_settings')
          .select('default_guide_fee_percentage, default_hiker_fee_percentage')
          .single();

        const guideFee = guide.uses_custom_fees 
          ? (guide.custom_guide_fee_percentage || 5) 
          : (settings?.default_guide_fee_percentage || 5);
        
        const hikerFee = guide.uses_custom_fees
          ? (guide.custom_hiker_fee_percentage || 10)
          : (settings?.default_hiker_fee_percentage || 10);

        // Calculate fees for final payment
        const finalPaymentCents = Math.round(booking.final_payment_amount * 100);
        const serviceFeeCents = Math.round(finalPaymentCents * (hikerFee / 100));
        const guideFeeCents = Math.round(finalPaymentCents * (guideFee / 100));
        const totalFee = serviceFeeCents + guideFeeCents;
        const totalChargeCents = finalPaymentCents + serviceFeeCents;

        // Create and confirm payment intent for final payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalChargeCents,
          currency: booking.tours.currency.toLowerCase(),
          customer: originalPaymentIntent.customer as string,
          payment_method: originalPaymentIntent.payment_method as string,
          off_session: true,
          confirm: true,
          application_fee_amount: totalFee,
          transfer_data: {
            destination: guide.stripe_account_id,
          },
          description: `Final payment for ${booking.tours.title} - ${booking.booking_reference}`,
          metadata: {
            booking_id: booking.id,
            booking_reference: booking.booking_reference,
            tour_id: booking.tour_id,
            guide_id: booking.guide_id,
            payment_type: 'final',
          },
        });

        logStep('Final payment collected', { 
          booking_reference: booking.booking_reference,
          payment_intent_id: paymentIntent.id 
        });

        // Update booking with final payment details
        await supabase
          .from('bookings')
          .update({
            final_payment_status: 'paid',
            final_payment_date: new Date().toISOString(),
            stripe_final_payment_intent_id: paymentIntent.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id);

        successCount++;

      } catch (error: any) {
        logStep('ERROR processing booking', { 
          booking_reference: booking.booking_reference,
          error: error.message 
        });

        // Update booking status to failed
        await supabase
          .from('bookings')
          .update({
            final_payment_status: 'failed',
            final_payment_error: error.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id);

        // Send notification to guide about failed payment
        await supabase.functions.invoke('send-email', {
          body: {
            to: booking.guide_id,
            template: 'final_payment_failed',
            data: {
              booking_reference: booking.booking_reference,
              tour_title: booking.tours.title,
              error_message: error.message,
            },
          },
        });

        failureCount++;
      }
    }

    logStep('Final payment collection completed', { successCount, failureCount });

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: bookings?.length || 0,
        successful: successCount,
        failed: failureCount 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    logStep('ERROR in collect-final-payments', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
