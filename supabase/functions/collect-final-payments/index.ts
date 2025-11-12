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
    logStep('Starting final payment collection process');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Find all bookings where final payment is due today or overdue
    const today = new Date().toISOString().split('T')[0];
    
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        hiker_id,
        hiker_email,
        guide_id,
        tour_id,
        final_payment_amount,
        final_payment_due_date,
        final_payment_status,
        stripe_payment_intent_id,
        tours(title, currency),
        guide_profiles!bookings_guide_id_fkey(stripe_account_id, uses_custom_fees, custom_guide_fee_percentage, custom_hiker_fee_percentage),
        profiles!bookings_hiker_id_fkey(name)
      `)
      .eq('payment_type', 'deposit')
      .lte('final_payment_due_date', today)
      .in('final_payment_status', ['pending', 'failed']);

    if (fetchError) {
      logStep('Error fetching bookings', { error: fetchError });
      throw fetchError;
    }

    if (!bookings || bookings.length === 0) {
      logStep('No final payments due today');
      return new Response(
        JSON.stringify({ message: 'No final payments due', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep(`Found ${bookings.length} bookings with final payment due`);

    let successCount = 0;
    let failureCount = 0;

    // Get platform fee settings
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('default_guide_fee_percentage, default_hiker_fee_percentage')
      .single();

    for (const booking of bookings) {
      try {
        logStep('Processing booking', { 
          bookingId: booking.id, 
          bookingReference: booking.booking_reference,
          finalPaymentAmount: booking.final_payment_amount 
        });

        // Retrieve the original payment intent to get the saved payment method
        const originalPaymentIntent = await stripe.paymentIntents.retrieve(
          booking.stripe_payment_intent_id
        );

        if (!originalPaymentIntent.payment_method) {
          logStep('No payment method saved for booking', { bookingId: booking.id });
          
          // Update booking to indicate manual payment required
          await supabase
            .from('bookings')
            .update({ 
              final_payment_status: 'requires_action',
              updated_at: new Date().toISOString()
            })
            .eq('id', booking.id);

          // Send email to hiker requesting manual payment
          await supabase.functions.invoke('send-email', {
            body: {
              to: booking.hiker_email,
              subject: `Final Payment Required - ${booking.booking_reference}`,
              html: `
                <h2>Final Payment Required</h2>
                <p>Dear ${booking.profiles.name},</p>
                <p>The final payment for your booking <strong>${booking.booking_reference}</strong> is now due.</p>
                <p>Amount due: ${booking.tours.currency} ${(booking.final_payment_amount || 0).toFixed(2)}</p>
                <p>We were unable to automatically charge your saved payment method. Please log in to your account to complete the payment manually.</p>
                <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/dashboard?section=bookings">View Booking</a></p>
              `
            }
          });

          failureCount++;
          continue;
        }

        // Calculate fees
        const guide = booking.guide_profiles;
        const guideFee = guide.uses_custom_fees 
          ? (guide.custom_guide_fee_percentage || 5) 
          : (settings?.default_guide_fee_percentage || 5);
        
        const hikerFee = guide.uses_custom_fees
          ? (guide.custom_hiker_fee_percentage || 10)
          : (settings?.default_hiker_fee_percentage || 10);

        const finalPaymentCents = Math.round((booking.final_payment_amount || 0) * 100);
        const serviceFeeCents = Math.round(finalPaymentCents * (hikerFee / 100));
        const totalChargeCents = finalPaymentCents + serviceFeeCents;
        
        const guideFeeCents = Math.round(finalPaymentCents * (guideFee / 100));
        const totalPlatformFee = serviceFeeCents + guideFeeCents;

        // Create payment intent for final payment using saved payment method
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalChargeCents,
          currency: booking.tours.currency.toLowerCase(),
          customer: originalPaymentIntent.customer as string,
          payment_method: originalPaymentIntent.payment_method as string,
          off_session: true, // Indicates this is an automatic charge
          confirm: true, // Automatically confirm the payment
          application_fee_amount: totalPlatformFee,
          transfer_data: {
            destination: guide.stripe_account_id,
          },
          on_behalf_of: guide.stripe_account_id,
          metadata: {
            booking_id: booking.id,
            tour_id: booking.tour_id,
            guide_id: booking.guide_id,
            is_final_payment: 'true',
            original_payment_intent: booking.stripe_payment_intent_id,
          },
          description: `Final payment for ${booking.tours.title} - ${booking.booking_reference}`,
        });

        logStep('Payment intent created', { 
          bookingId: booking.id, 
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status 
        });

        // Update booking with final payment details
        await supabase
          .from('bookings')
          .update({
            final_payment_intent_id: paymentIntent.id,
            final_payment_status: paymentIntent.status === 'succeeded' ? 'paid' : 'processing',
            payment_status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id);

        // Send confirmation email
        if (paymentIntent.status === 'succeeded') {
          await supabase.functions.invoke('send-email', {
            body: {
              to: booking.hiker_email,
              subject: `Final Payment Processed - ${booking.booking_reference}`,
              html: `
                <h2>Final Payment Successful</h2>
                <p>Dear ${booking.profiles.name},</p>
                <p>Your final payment for <strong>${booking.booking_reference}</strong> has been processed successfully.</p>
                <p>Amount charged: ${booking.tours.currency} ${(booking.final_payment_amount || 0).toFixed(2)}</p>
                <p>Your booking is now fully paid. We look forward to seeing you on the trail!</p>
              `
            }
          });
        }

        successCount++;
        logStep('Booking processed successfully', { bookingId: booking.id });

      } catch (error: any) {
        logStep('Error processing booking', { 
          bookingId: booking.id, 
          error: error.message,
          code: error.code 
        });

        // Handle specific error cases
        let finalPaymentStatus = 'failed';
        let emailSubject = 'Final Payment Failed';
        let emailMessage = 'We were unable to process your final payment.';

        if (error.code === 'card_declined' || error.code === 'insufficient_funds') {
          finalPaymentStatus = 'requires_action';
          emailSubject = 'Final Payment Declined - Action Required';
          emailMessage = `Your card was declined. ${error.message}`;
        } else if (error.code === 'authentication_required') {
          finalPaymentStatus = 'requires_action';
          emailSubject = 'Payment Authentication Required';
          emailMessage = 'Your bank requires additional authentication for this payment.';
        }

        // Update booking status
        await supabase
          .from('bookings')
          .update({
            final_payment_status: finalPaymentStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id);

        // Send failure notification
        await supabase.functions.invoke('send-email', {
          body: {
            to: booking.hiker_email,
            subject: `${emailSubject} - ${booking.booking_reference}`,
            html: `
              <h2>${emailSubject}</h2>
              <p>Dear ${booking.profiles.name},</p>
              <p>${emailMessage}</p>
              <p>Amount due: ${booking.tours.currency} ${(booking.final_payment_amount || 0).toFixed(2)}</p>
              <p>Please log in to your account to update your payment method and complete the payment.</p>
              <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/dashboard?section=bookings">View Booking</a></p>
            `
          }
        });

        failureCount++;
      }
    }

    logStep('Final payment collection completed', { 
      total: bookings.length, 
      successful: successCount, 
      failed: failureCount 
    });

    return new Response(
      JSON.stringify({ 
        message: 'Final payment collection completed',
        total: bookings.length,
        successful: successCount,
        failed: failureCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logStep('ERROR in collect-final-payments', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
