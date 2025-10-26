-- Add hiker_name column to reviews table for public display
ALTER TABLE public.reviews
ADD COLUMN hiker_name TEXT;

-- Create function to update hiker name from profile
CREATE OR REPLACE FUNCTION public.set_review_hiker_name()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- When review is published, copy the hiker's name from their profile
  IF NEW.review_status = 'published' AND NEW.hiker_name IS NULL THEN
    SELECT name INTO NEW.hiker_name
    FROM public.profiles
    WHERE id = NEW.hiker_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to set hiker name on review publish
CREATE TRIGGER trigger_set_review_hiker_name
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_review_hiker_name();

-- Backfill existing published reviews with hiker names
UPDATE public.reviews r
SET hiker_name = p.name
FROM public.profiles p
WHERE r.hiker_id = p.id
  AND r.review_status = 'published'
  AND r.hiker_name IS NULL;