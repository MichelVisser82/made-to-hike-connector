-- Function to update tour review statistics
CREATE OR REPLACE FUNCTION public.update_tour_review_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_tour_id uuid;
  v_avg_rating numeric;
  v_review_count integer;
BEGIN
  -- Determine which tour_id to update
  IF TG_OP = 'DELETE' THEN
    v_tour_id := OLD.tour_id;
  ELSE
    v_tour_id := NEW.tour_id;
  END IF;

  -- Calculate average rating and count for published hiker-to-guide reviews
  SELECT 
    COALESCE(ROUND(AVG(overall_rating), 1), 0),
    COUNT(*)
  INTO v_avg_rating, v_review_count
  FROM public.reviews
  WHERE tour_id = v_tour_id
    AND review_type = 'hiker_to_guide'
    AND review_status = 'published';

  -- Update the tour statistics
  UPDATE public.tours
  SET 
    rating = v_avg_rating,
    reviews_count = v_review_count,
    updated_at = NOW()
  WHERE id = v_tour_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger to automatically update tour stats when reviews change
DROP TRIGGER IF EXISTS trigger_update_tour_review_stats ON public.reviews;

CREATE TRIGGER trigger_update_tour_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tour_review_stats();

-- Backfill existing tour statistics
UPDATE public.tours t
SET 
  rating = COALESCE((
    SELECT ROUND(AVG(r.overall_rating), 1)
    FROM public.reviews r
    WHERE r.tour_id = t.id
      AND r.review_type = 'hiker_to_guide'
      AND r.review_status = 'published'
  ), 0),
  reviews_count = COALESCE((
    SELECT COUNT(*)
    FROM public.reviews r
    WHERE r.tour_id = t.id
      AND r.review_type = 'hiker_to_guide'
      AND r.review_status = 'published'
  ), 0),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.reviews r 
  WHERE r.tour_id = t.id 
    AND r.review_type = 'hiker_to_guide'
    AND r.review_status = 'published'
);