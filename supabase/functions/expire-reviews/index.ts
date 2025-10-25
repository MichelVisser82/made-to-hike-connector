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

    // Find reviews past expiration date with status='draft'
    const now = new Date().toISOString();

    const { data: expiredReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        hiker_id,
        guide_id,
        review_type,
        booking_id,
        paired_review_id,
        expires_at
      `)
      .eq('review_status', 'draft')
      .lt('expires_at', now);

    if (reviewsError) throw reviewsError;

    console.log(`Found ${expiredReviews?.length || 0} expired reviews`);

    const results = [];

    for (const review of expiredReviews || []) {
      try {
        // Check paired review status
        let pairedStatus = null;
        if (review.paired_review_id) {
          const { data: pairedReview } = await supabase
            .from('reviews')
            .select('review_status')
            .eq('id', review.paired_review_id)
            .single();

          pairedStatus = pairedReview?.review_status;
        }

        // If paired review also expired or doesn't exist: mark as 'void'
        // If paired review is 'submitted': mark paired as 'void' too
        if (!pairedStatus || pairedStatus === 'expired' || pairedStatus === 'void') {
          await supabase
            .from('reviews')
            .update({ review_status: 'void' })
            .eq('id', review.id);

          console.log(`Review ${review.id} marked as void`);
        } else if (pairedStatus === 'submitted') {
          // Mark both as void since one expired
          await supabase
            .from('reviews')
            .update({ review_status: 'void' })
            .in('id', [review.id, review.paired_review_id]);

          console.log(`Both reviews (${review.id}, ${review.paired_review_id}) marked as void`);
        } else {
          // Just mark this one as expired
          await supabase
            .from('reviews')
            .update({ review_status: 'expired' })
            .eq('id', review.id);

          console.log(`Review ${review.id} marked as expired`);
        }

        // Send "review period ended" notification
        const recipientId = review.review_type === 'hiker_to_guide' ? review.hiker_id : review.guide_id;
        const recipientType = review.review_type === 'hiker_to_guide' ? 'hiker' : 'guide';

        // TODO: Send email notification via send-email function

        results.push({
          review_id: review.id,
          success: true,
          new_status: pairedStatus === 'submitted' ? 'void' : 'expired'
        });
      } catch (error) {
        console.error(`Error expiring review ${review.id}:`, error);
        results.push({
          review_id: review.id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in expire-reviews:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
