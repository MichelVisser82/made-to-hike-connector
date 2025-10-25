-- Migration 3: Add RLS policies and database functions for review system

-- ===== RLS POLICIES FOR review_responses =====

CREATE POLICY "Users can view responses on reviews they wrote or received"
  ON review_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_responses.review_id
      AND (r.guide_id = auth.uid() OR r.hiker_id = auth.uid())
    )
  );

CREATE POLICY "Users can post one response to reviews they received"
  ON review_responses FOR INSERT
  WITH CHECK (
    auth.uid() = responder_id
    AND EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_responses.review_id
      AND r.review_status = 'published'
      AND (
        (responder_type = 'guide' AND r.guide_id = auth.uid()) OR
        (responder_type = 'hiker' AND r.hiker_id = auth.uid())
      )
    )
  );

CREATE POLICY "Admins can manage all responses"
  ON review_responses FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- ===== RLS POLICIES FOR review_notifications =====

CREATE POLICY "Users can view their own notifications"
  ON review_notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can view all notifications"
  ON review_notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- ===== UPDATE REVIEWS RLS POLICIES =====

-- Drop old policies to update them
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Hikers can create reviews for their bookings" ON reviews;
DROP POLICY IF EXISTS "Hikers can update their own reviews" ON reviews;

-- Users can view their own reviews (any status)
CREATE POLICY "Users can view their own draft and submitted reviews"
  ON reviews FOR SELECT
  USING (
    auth.uid() = hiker_id OR auth.uid() = guide_id
  );

-- Users can view published reviews about them
CREATE POLICY "Public can view published reviews"
  ON reviews FOR SELECT
  USING (review_status = 'published');

-- Hikers can create reviews for completed bookings
CREATE POLICY "Hikers can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = hiker_id 
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id 
      AND bookings.hiker_id = auth.uid()
    )
  );

-- Guides can create reviews for hikers on their tours
CREATE POLICY "Guides can create reviews for hikers"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = guide_id 
    AND EXISTS (
      SELECT 1 FROM bookings b
      JOIN tours t ON t.id = b.tour_id
      WHERE b.id = reviews.booking_id 
      AND t.guide_id = auth.uid()
    )
  );

-- Users can update their own reviews only if draft
CREATE POLICY "Users can update their own draft reviews"
  ON reviews FOR UPDATE
  USING (
    (auth.uid() = hiker_id OR auth.uid() = guide_id)
    AND review_status = 'draft'
  );

-- ===== DATABASE FUNCTIONS =====

-- Function to calculate guide average ratings from published reviews
CREATE OR REPLACE FUNCTION calculate_guide_average_ratings(guide_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'expertise', ROUND(AVG((category_ratings->>'expertise')::numeric), 1),
    'safety', ROUND(AVG((category_ratings->>'safety')::numeric), 1),
    'communication', ROUND(AVG((category_ratings->>'communication')::numeric), 1),
    'leadership', ROUND(AVG((category_ratings->>'leadership')::numeric), 1),
    'value', ROUND(AVG((category_ratings->>'value')::numeric), 1),
    'overall', ROUND(AVG(overall_rating), 1),
    'total_reviews', COUNT(*)
  )
  INTO result
  FROM reviews
  WHERE guide_id = guide_user_id
    AND review_type = 'hiker_to_guide'
    AND review_status = 'published'
    AND category_ratings IS NOT NULL;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get review pair status for a booking
CREATE OR REPLACE FUNCTION get_review_pair_status(booking_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  hiker_review reviews%ROWTYPE;
  guide_review reviews%ROWTYPE;
BEGIN
  SELECT * INTO hiker_review FROM reviews
  WHERE booking_id = booking_uuid AND review_type = 'hiker_to_guide'
  LIMIT 1;
  
  SELECT * INTO guide_review FROM reviews
  WHERE booking_id = booking_uuid AND review_type = 'guide_to_hiker'
  LIMIT 1;
  
  result := jsonb_build_object(
    'hiker_review_status', COALESCE(hiker_review.review_status, 'not_created'),
    'guide_review_status', COALESCE(guide_review.review_status, 'not_created'),
    'hiker_review_id', hiker_review.id,
    'guide_review_id', guide_review.id,
    'expires_at', COALESCE(hiker_review.expires_at, guide_review.expires_at),
    'published_at', COALESCE(hiker_review.published_at, guide_review.published_at),
    'both_submitted', (hiker_review.review_status = 'submitted' AND guide_review.review_status = 'submitted'),
    'ready_to_publish', (hiker_review.review_status = 'submitted' AND guide_review.review_status = 'submitted')
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;