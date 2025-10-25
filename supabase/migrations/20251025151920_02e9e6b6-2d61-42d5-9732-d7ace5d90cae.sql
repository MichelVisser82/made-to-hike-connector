-- Drop the incorrect unique constraint on booking_id alone
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_key;

-- Add the correct composite unique constraint on (booking_id, review_type)
-- This allows one hiker_to_guide and one guide_to_hiker review per booking
ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_booking_id_review_type_key 
  UNIQUE (booking_id, review_type);