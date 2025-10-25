import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface PostResponsePayload {
  reviewId: string;
  responderId: string;
  responderType: 'guide' | 'hiker';
  responseText: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: PostResponsePayload = await req.json();

    const { reviewId, responderId, responderType, responseText } = payload;

    // Validate input
    if (!reviewId || !responderId || !responderType || !responseText) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (responseText.length > 300) {
      return new Response(
        JSON.stringify({ error: 'Response text exceeds 300 character limit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if review is published
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('review_status, guide_id, hiker_id, booking_id')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return new Response(
        JSON.stringify({ error: 'Review not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (review.review_status !== 'published') {
      return new Response(
        JSON.stringify({ error: 'Review is not published yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify responder is the subject of the review
    const isValidResponder = 
      (responderType === 'guide' && review.guide_id === responderId) ||
      (responderType === 'hiker' && review.hiker_id === responderId);

    if (!isValidResponder) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to respond to this review' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Check if response already exists
    const { data: existingResponse } = await supabase
      .from('review_responses')
      .select('id')
      .eq('review_id', reviewId)
      .maybeSingle();

    if (existingResponse) {
      return new Response(
        JSON.stringify({ error: 'Response already exists for this review' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // TODO: Moderate response text for offensive content
    // For now, auto-approve
    const moderationStatus = 'approved';

    // Create response record
    const { data: response, error: insertError } = await supabase
      .from('review_responses')
      .insert({
        review_id: reviewId,
        responder_id: responderId,
        responder_type: responderType,
        response_text: responseText,
        moderation_status: moderationStatus
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send notification to original reviewer
    const originalReviewerId = responderType === 'guide' ? review.hiker_id : review.guide_id;
    const originalReviewerType = responderType === 'guide' ? 'hiker' : 'guide';

    await supabase.from('review_notifications').insert({
      booking_id: review.booking_id,
      recipient_id: originalReviewerId,
      recipient_type: originalReviewerType,
      notification_type: 'response_received'
    });

    // TODO: Send email notification via send-email function
    console.log(`Response posted for review ${reviewId}`);

    return new Response(
      JSON.stringify({
        success: true,
        response: response,
        message: 'Response posted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in post-review-response:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
