import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-08-27.basil',
});

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REFUND] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const { booking_id, refund_amount, reason } = await req.json();

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'booking_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Processing refund for booking', { booking_id, refund_amount, reason });

    // Create Supabase client with service role for secure operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep('Authentication failed', { error: userError });
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    logStep('User authenticated', { userId });

    // Fetch booking details with tour information
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        tours!inner(
          guide_id,
          title,
          guide_display_name
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
      payment_status: booking.payment_status,
      stripe_payment_intent_id: booking.stripe_payment_intent_id 
    });

    // Fetch hiker and guide profiles early (needed for emails)
    const { data: hikerProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', booking.hiker_id)
      .single();

    const { data: guideProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, name')
      .eq('id', booking.tours.guide_id)
      .single();

    // Authorization check: must be guide of the tour or admin
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const isAdmin = userRoles?.some(r => r.role === 'admin') || false;
    const isGuide = booking.tours.guide_id === userId;

    if (!isAdmin && !isGuide) {
      logStep('Authorization failed', { userId, guideId: booking.tours.guide_id, isAdmin });
      return new Response(
        JSON.stringify({ error: 'Not authorized to refund this booking' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle bookings with no payment (abandoned checkout)
    if (!booking.stripe_payment_intent_id) {
      logStep('No payment intent found - abandoned checkout, cancelling booking directly');
      
      // Update booking status to cancelled (no refund needed since no payment was made)
      const { error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({
          status: 'cancelled',
          payment_status: 'pending', // Keep as pending since no payment was completed
          refund_status: 'not_applicable', // No payment was made
          refund_reason: reason || 'Booking cancelled before payment completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking_id);

      if (updateError) {
        logStep('Failed to update booking', { error: updateError });
        return new Response(
          JSON.stringify({ error: 'Failed to cancel booking' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send notifications about cancellation
      if (hikerProfile?.email) {
        try {
          await supabaseAdmin.functions.invoke('send-email', {
            body: {
              type: 'booking_cancellation_hiker',
              to: hikerProfile.email,
              data: {
                hiker_name: hikerProfile.name,
                tour_title: booking.tours.title,
                booking_reference: booking.booking_reference,
                booking_date: booking.booking_date,
                guide_name: booking.tours.guide_display_name,
                reason: reason || 'Booking cancelled before payment completed'
              }
            }
          });
        } catch (emailError) {
          logStep('Failed to send hiker email', { error: emailError });
        }
      }

      if (guideProfile?.email) {
        try {
          await supabaseAdmin.functions.invoke('send-email', {
            body: {
              type: 'booking_cancellation_guide',
              to: guideProfile.email,
              data: {
                guide_name: guideProfile.name,
                tour_title: booking.tours.title,
                booking_reference: booking.booking_reference,
                booking_date: booking.booking_date,
                hiker_name: hikerProfile?.name || 'Guest',
                cancelled_at: new Date().toISOString()
              }
            }
          });
        } catch (emailError) {
          logStep('Failed to send guide email', { error: emailError });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Booking cancelled successfully. No payment was made, so no refund is needed.',
          booking_reference: booking.booking_reference,
          abandoned_checkout: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the actual current status from Stripe (database might be outdated)
    logStep('Fetching current payment intent status from Stripe');
    const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
    
    logStep('Current Stripe payment status', { 
      db_status: booking.payment_status,
      stripe_status: paymentIntent.status 
    });

    // Determine if we can cancel or need to refund based on actual Stripe status
    const canBeCancelled = [
      'requires_payment_method',
      'requires_capture', 
      'requires_reauthorization',
      'requires_confirmation',
      'requires_action',
      'processing'
    ].includes(paymentIntent.status);
    
    const canBeRefunded = paymentIntent.status === 'succeeded';
    
    if (!canBeCancelled && !canBeRefunded) {
      logStep('Payment cannot be cancelled or refunded', { status: paymentIntent.status });
      return new Response(
        JSON.stringify({ error: `Cannot process cancellation for payment with status: ${paymentIntent.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already refunded
    if (booking.refund_status === 'succeeded') {
      logStep('Already refunded', { refund_id: booking.stripe_refund_id });
      return new Response(
        JSON.stringify({ 
          error: 'This booking has already been refunded',
          refund_id: booking.stripe_refund_id 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the actual amount charged from Stripe, not the database amount
    // This handles cases where deposit + fees were charged, or partial payments
    const actualAmountCharged = paymentIntent.amount; // Already in cents
    const actualAmountInDollars = actualAmountCharged / 100;
    
    logStep('Amount to refund', {
      stripe_amount_cents: actualAmountCharged,
      stripe_amount_dollars: actualAmountInDollars,
      booking_total_price: booking.total_price,
      booking_deposit: booking.deposit_amount,
      payment_type: booking.payment_type
    });

    // If a specific refund_amount is provided and it's less than what was charged, use it
    const amountInCents = refund_amount 
      ? Math.min(Math.round(Number(refund_amount) * 100), actualAmountCharged)
      : actualAmountCharged;

    // For payments that can be cancelled, cancel the payment intent
    // For succeeded payments, create a refund
    if (canBeCancelled) {
      logStep('Cancelling payment intent (payment still processing)', { 
        payment_intent: booking.stripe_payment_intent_id
      });

      try {
        // Cancel the payment intent
        const cancelledPayment = await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
        logStep('Payment intent cancelled', { status: cancelledPayment.status });

        // Update booking status to cancelled
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'cancelled',
            payment_status: 'cancelled',
            refund_status: 'succeeded', // Cancellation is immediate
            refund_reason: reason || 'Booking declined by guide',
            refund_amount: actualAmountInDollars,
            updated_at: new Date().toISOString()
          })
          .eq('id', booking_id);

        // Send notifications about cancellation (no refund needed since payment never succeeded)
        if (hikerProfile?.email) {
          try {
            await supabaseAdmin.functions.invoke('send-email', {
              body: {
                type: 'booking_refund_hiker',
                to: hikerProfile.email,
                data: {
                  hiker_name: hikerProfile.name,
                  tour_title: booking.tours.title,
                  booking_reference: booking.booking_reference,
                  booking_date: booking.booking_date,
                  refund_amount: actualAmountInDollars,
                  currency: booking.currency,
                  original_amount: booking.total_price,
                  refund_reason: reason || 'Booking declined by guide',
                  guide_name: booking.tours.guide_display_name
                }
              }
            });
          } catch (emailError) {
            logStep('Failed to send hiker email', { error: emailError });
          }
        }

        if (guideProfile?.email) {
          try {
            await supabaseAdmin.functions.invoke('send-email', {
              body: {
                type: 'booking_cancellation_guide',
                to: guideProfile.email,
                data: {
                  guide_name: guideProfile.name,
                  tour_title: booking.tours.title,
                  booking_reference: booking.booking_reference,
                  booking_date: booking.booking_date,
                  hiker_name: hikerProfile?.name || 'Guest',
                  refund_amount: actualAmountInDollars,
                  currency: booking.currency,
                  cancelled_at: new Date().toISOString()
                }
              }
            });
          } catch (emailError) {
            logStep('Failed to send guide email', { error: emailError });
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Booking cancelled successfully. No charge was made to the customer.',
            booking_reference: booking.booking_reference,
            refund_amount: actualAmountInDollars,
            cancelled_payment: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (cancelError: any) {
        logStep('Failed to cancel payment intent', { error: cancelError.message });
        
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'cancelled',
            refund_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', booking_id);

        return new Response(
          JSON.stringify({ 
            error: 'Failed to cancel payment',
            details: cancelError.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    logStep('Creating Stripe refund', { 
      payment_intent: booking.stripe_payment_intent_id,
      amount: amountInCents,
      reason: reason || 'requested_by_customer'
    });

    // Update booking status to cancelled and set refund as pending
    const { error: updateError1 } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'cancelled',
        refund_status: 'pending',
        refund_reason: reason || 'Booking declined by guide',
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id);

    if (updateError1) {
      logStep('Failed to update booking status', { error: updateError1 });
    }

    // Create Stripe refund
    let stripeRefund;
    try {
      stripeRefund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: amountInCents,
        reason: 'requested_by_customer',
        metadata: {
          booking_id: booking_id,
          booking_reference: booking.booking_reference,
          tour_id: booking.tour_id,
          refund_reason: reason || 'declined_by_guide'
        }
      });

      logStep('Stripe refund created', { refund_id: stripeRefund.id, status: stripeRefund.status });
    } catch (stripeError: any) {
      logStep('Stripe refund failed', { error: stripeError.message });
      
      // Update booking with failed refund status
      await supabaseAdmin
        .from('bookings')
        .update({
          refund_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking_id);

      return new Response(
        JSON.stringify({ 
          error: 'Failed to process refund with Stripe',
          details: stripeError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking with successful refund information
    const { error: updateError2 } = await supabaseAdmin
      .from('bookings')
      .update({
        refund_amount: actualAmountInDollars,
        refund_status: stripeRefund.status, // 'succeeded', 'pending', 'failed'
        refunded_at: new Date().toISOString(),
        stripe_refund_id: stripeRefund.id,
        payment_status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id);

    if (updateError2) {
      logStep('Failed to update booking with refund info', { error: updateError2 });
    }

    logStep('Sending email notifications', {
      hiker_email: hikerProfile?.email,
      guide_email: guideProfile?.email
    });

    // Send email to hiker about refund
    if (hikerProfile?.email) {
      try {
        await supabaseAdmin.functions.invoke('send-email', {
          body: {
            type: 'booking_refund_hiker',
            to: hikerProfile.email,
            data: {
              hiker_name: hikerProfile.name,
              tour_title: booking.tours.title,
              booking_reference: booking.booking_reference,
              booking_date: booking.booking_date,
              refund_amount: actualAmountInDollars,
              currency: booking.currency,
              original_amount: booking.total_price,
              refund_reason: reason || 'Booking declined by guide',
              guide_name: booking.tours.guide_display_name
            }
          }
        });
        logStep('Hiker email sent successfully');
      } catch (emailError) {
        logStep('Failed to send hiker email', { error: emailError });
      }
    }

    // Send email to guide about cancellation
    if (guideProfile?.email) {
      try {
        await supabaseAdmin.functions.invoke('send-email', {
          body: {
            type: 'booking_cancellation_guide',
            to: guideProfile.email,
            data: {
              guide_name: guideProfile.name,
              tour_title: booking.tours.title,
              booking_reference: booking.booking_reference,
              booking_date: booking.booking_date,
              hiker_name: hikerProfile?.name || 'Guest',
              refund_amount: actualAmountInDollars,
              currency: booking.currency,
              cancelled_at: new Date().toISOString()
            }
          }
        });
        logStep('Guide email sent successfully');
      } catch (emailError) {
        logStep('Failed to send guide email', { error: emailError });
      }
    }

    logStep('Refund processed successfully', {
      refund_id: stripeRefund.id,
      amount: actualAmountInDollars
    });

    return new Response(
      JSON.stringify({
        success: true,
        refund_id: stripeRefund.id,
        refund_amount: actualAmountInDollars,
        refund_status: stripeRefund.status,
        booking_reference: booking.booking_reference,
        message: 'Refund processed successfully. The customer will receive the refund in 3-10 business days.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logStep('Unexpected error', { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});