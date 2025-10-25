import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SubmitReviewPayload {
  reviewId: string;
  overallRating: number;
  comment: string;
  categoryRatings?: {
    expertise: number;
    safety: number;
    communication: number;
    leadership: number;
    value: number;
  };
  quickAssessment?: {
    fitness_accurate: boolean;
    well_prepared: boolean;
    great_companion: boolean;
    would_guide_again: boolean;
  };
  highlightTags?: string[];
  photos?: string[];
  privateSafetyNotes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: SubmitReviewPayload = await req.json();

    const { 
      reviewId, 
      overallRating, 
      comment, 
      categoryRatings, 
      quickAssessment,
      highlightTags,
      photos,
      privateSafetyNotes
    } = payload;

    // Validate review data
    if (!reviewId || !overallRating || !comment) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*, paired_review_id')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return new Response(
        JSON.stringify({ error: 'Review not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if already submitted or expired
    if (review.review_status !== 'draft') {
      return new Response(
        JSON.stringify({ error: 'Review cannot be modified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update review status from 'draft' to 'submitted'
    const updateData: any = {
      review_status: 'submitted',
      overall_rating: overallRating,
      comment: comment,
      updated_at: new Date().toISOString()
    };

    if (categoryRatings) {
      updateData.category_ratings = categoryRatings;
    }

    if (quickAssessment) {
      updateData.quick_assessment = quickAssessment;
    }

    if (highlightTags) {
      updateData.highlight_tags = highlightTags;
    }

    if (photos) {
      updateData.photos = photos;
    }

    if (privateSafetyNotes !== undefined) {
      updateData.private_safety_notes = privateSafetyNotes;
    }

    await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId);

    // Check paired review status
    let shouldPublish = false;
    let pairedReviewStatus = null;

    if (review.paired_review_id) {
      const { data: pairedReview } = await supabase
        .from('reviews')
        .select('review_status')
        .eq('id', review.paired_review_id)
        .single();

      pairedReviewStatus = pairedReview?.review_status;

      // If both submitted: publish both simultaneously
      if (pairedReviewStatus === 'submitted') {
        shouldPublish = true;
      }
    }

    if (shouldPublish && review.paired_review_id) {
      const publishedAt = new Date().toISOString();

      // Update both to published
      await supabase
        .from('reviews')
        .update({ 
          review_status: 'published',
          published_at: publishedAt
        })
        .in('id', [reviewId, review.paired_review_id]);

      // Send "Review Published" notifications to both parties
      await supabase.from('review_notifications').insert([
        {
          booking_id: review.booking_id,
          recipient_id: review.hiker_id,
          recipient_type: 'hiker',
          notification_type: 'review_published'
        },
        {
          booking_id: review.booking_id,
          recipient_id: review.guide_id,
          recipient_type: 'guide',
          notification_type: 'review_published'
        }
      ]);

      // Recalculate guide's average ratings
      await supabase.rpc('calculate_guide_average_ratings', {
        guide_user_id: review.guide_id
      });

      // TODO: Send email notifications via send-email function
      console.log(`Both reviews published for booking ${review.booking_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          status: 'published',
          message: 'Both reviews have been published'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      // Send nudge to other party
      const otherPartyId = review.review_type === 'hiker_to_guide' ? review.guide_id : review.hiker_id;
      const otherPartyType = review.review_type === 'hiker_to_guide' ? 'guide' : 'hiker';

      // TODO: Send nudge email via send-email function
      console.log(`Review ${reviewId} submitted, waiting for pair`);

      return new Response(
        JSON.stringify({
          success: true,
          status: 'submitted',
          message: 'Your review will be published when the other party completes theirs'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in submit-review:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
