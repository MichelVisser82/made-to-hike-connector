import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if this is an immediate manual completion request
    const body = await req.json().catch(() => ({}));
    const isImmediate = body?.immediate === true;
    const specificBookingId = body?.booking_id;

    let completedBookings;

    if (isImmediate && specificBookingId) {
      // Process specific booking immediately (manual completion)
      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          hiker_id,
          tour_id,
          booking_date,
          tours!inner (
            id,
            guide_id,
            duration,
            title
          )
        `)
        .eq('id', specificBookingId)
        .eq('status', 'completed')
        .maybeSingle();

      if (bookingsError) throw bookingsError;
      completedBookings = data ? [data] : [];
    } else {
      // Find bookings that completed 24 hours ago (scheduled processing)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          hiker_id,
          tour_id,
          booking_date,
          tours!inner (
            id,
            guide_id,
            duration,
            title
          )
        `)
        .eq('status', 'confirmed')
        .lt('booking_date', twentyFourHoursAgo);

      if (bookingsError) throw bookingsError;
      completedBookings = data;
    }

    console.log(`Found ${completedBookings?.length || 0} completed bookings`);

    const results = [];

    for (const booking of completedBookings || []) {
      try {
        // Check if reviews already exist for this booking
        const { data: existingReviews } = await supabase
          .from('reviews')
          .select('id')
          .eq('booking_id', booking.id);

        if (existingReviews && existingReviews.length > 0) {
          console.log(`Reviews already exist for booking ${booking.id}`);
          continue;
        }

        // Update booking status to completed (for scheduled processing only)
        if (!isImmediate) {
          await supabase
            .from('bookings')
            .update({ status: 'completed' })
            .eq('id', booking.id);
        }

        // Set expiration to 6 days from now
        const expiresAt = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();

        // Create hiker→guide review record
        const { data: hikerReview, error: hikerReviewError } = await supabase
          .from('reviews')
          .insert({
            booking_id: booking.id,
            tour_id: booking.tour_id,
            hiker_id: booking.hiker_id,
            guide_id: booking.tours.guide_id,
            review_type: 'hiker_to_guide',
            review_status: 'draft',
            expires_at: expiresAt,
            overall_rating: 0,
            comment: ''
          })
          .select()
          .single();

        if (hikerReviewError) throw hikerReviewError;

        // Create guide→hiker review record
        const { data: guideReview, error: guideReviewError } = await supabase
          .from('reviews')
          .insert({
            booking_id: booking.id,
            tour_id: booking.tour_id,
            hiker_id: booking.hiker_id,
            guide_id: booking.tours.guide_id,
            review_type: 'guide_to_hiker',
            review_status: 'draft',
            expires_at: expiresAt,
            overall_rating: 0,
            comment: ''
          })
          .select()
          .single();

        if (guideReviewError) throw guideReviewError;

        // Link paired reviews
        await supabase
          .from('reviews')
          .update({ paired_review_id: guideReview.id })
          .eq('id', hikerReview.id);

        await supabase
          .from('reviews')
          .update({ paired_review_id: hikerReview.id })
          .eq('id', guideReview.id);

        // Send "review available" notifications to both parties
        await supabase.from('review_notifications').insert([
          {
            booking_id: booking.id,
            recipient_id: booking.hiker_id,
            recipient_type: 'hiker',
            notification_type: 'review_available'
          },
          {
            booking_id: booking.id,
            recipient_id: booking.tours.guide_id,
            recipient_type: 'guide',
            notification_type: 'review_available'
          }
        ]);

        // Send emails (TODO: Integrate with send-email function)
        // For now, log that emails should be sent
        console.log(`Review notifications created for booking ${booking.id}`);

        results.push({
          booking_id: booking.id,
          success: true,
          hiker_review_id: hikerReview.id,
          guide_review_id: guideReview.id
        });
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        results.push({
          booking_id: booking.id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in process-tour-completions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
