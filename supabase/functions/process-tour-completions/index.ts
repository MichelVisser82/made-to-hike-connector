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
          .select('id, review_type')
          .eq('booking_id', booking.id);

        const hasHikerReview = existingReviews?.some(r => r.review_type === 'hiker_to_guide');
        const hasGuideReview = existingReviews?.some(r => r.review_type === 'guide_to_hiker');

        if (hasHikerReview && hasGuideReview) {
          console.log(`Both reviews already exist for booking ${booking.id}`);
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

        // Create reviews only if they don't exist
        let hikerReview = existingReviews?.find(r => r.review_type === 'hiker_to_guide');
        let guideReview = existingReviews?.find(r => r.review_type === 'guide_to_hiker');

        // Create hiker→guide review if it doesn't exist
        if (!hasHikerReview) {
          const { data, error: hikerReviewError } = await supabase
            .from('reviews')
            .insert({
              booking_id: booking.id,
              tour_id: booking.tour_id,
              hiker_id: booking.hiker_id,
              guide_id: booking.tours.guide_id,
              review_type: 'hiker_to_guide',
              review_status: 'draft',
              expires_at: expiresAt,
              overall_rating: 5, // Temporary default, will be overwritten when user submits
              comment: ''
            })
            .select()
            .single();

          if (hikerReviewError) throw hikerReviewError;
          hikerReview = data;
        }

        // Create guide→hiker review if it doesn't exist
        if (!hasGuideReview) {
          const { data, error: guideReviewError } = await supabase
            .from('reviews')
            .insert({
              booking_id: booking.id,
              tour_id: booking.tour_id,
              hiker_id: booking.hiker_id,
              guide_id: booking.tours.guide_id,
              review_type: 'guide_to_hiker',
              review_status: 'draft',
              expires_at: expiresAt,
              overall_rating: 5, // Temporary default, will be overwritten when user submits
              comment: ''
            })
            .select()
            .single();

          if (guideReviewError) throw guideReviewError;
          guideReview = data;
        }

        // Link paired reviews if both exist
        if (hikerReview?.id && guideReview?.id) {
          await supabase
            .from('reviews')
            .update({ paired_review_id: guideReview.id })
            .eq('id', hikerReview.id);

          await supabase
            .from('reviews')
            .update({ paired_review_id: hikerReview.id })
            .eq('id', guideReview.id);
        }

        // Send "review available" notifications to both parties (only if not already sent)
        const { data: existingNotifications } = await supabase
          .from('review_notifications')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('notification_type', 'review_available');

        if (!existingNotifications || existingNotifications.length === 0) {
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

          // Fetch profile data for email
          const { data: hikerProfile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', booking.hiker_id)
            .single();

          const { data: guideProfile } = await supabase
            .from('guide_profiles')
            .select('display_name, user_id')
            .eq('user_id', booking.tours.guide_id)
            .single();

          const { data: guideUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', booking.tours.guide_id)
            .single();

          const expiresDate = new Date(expiresAt).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          });
          const bookingDateFormatted = new Date(booking.booking_date).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          });

          // Send email to hiker
          if (hikerProfile?.email) {
            const hikerReviewUrl = `https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard?section=inbox&tab=reviews&bookingId=${booking.id}`;
            
            try {
              await supabase.functions.invoke('send-email', {
                body: {
                  type: 'review_available',
                  to: hikerProfile.email,
                  data: {
                    recipientName: hikerProfile.name,
                    recipientType: 'hiker',
                    tourTitle: booking.tours.title,
                    bookingDate: bookingDateFormatted,
                    reviewUrl: hikerReviewUrl,
                    expiresDate: expiresDate
                  }
                }
              });
              console.log(`Review available email sent to hiker ${hikerProfile.email}`);
            } catch (error) {
              console.error(`Failed to send email to hiker:`, error);
            }
          }

          // Send email to guide
          if (guideUser?.email && guideProfile) {
            const guideReviewUrl = `https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard?section=inbox&tab=reviews&bookingId=${booking.id}`;
            
            try {
              await supabase.functions.invoke('send-email', {
                body: {
                  type: 'review_available',
                  to: guideUser.email,
                  data: {
                    recipientName: guideProfile.display_name,
                    recipientType: 'guide',
                    tourTitle: booking.tours.title,
                    bookingDate: bookingDateFormatted,
                    reviewUrl: guideReviewUrl,
                    expiresDate: expiresDate
                  }
                }
              });
              console.log(`Review available email sent to guide ${guideUser.email}`);
            } catch (error) {
              console.error(`Failed to send email to guide:`, error);
            }
          }

          console.log(`Review notifications and emails created for booking ${booking.id}`);
        }

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
