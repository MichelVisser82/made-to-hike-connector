-- Add RLS policy to allow viewing guide profiles for guides with active tours
-- This ensures booking flow can access guide data even if profile isn't verified yet

CREATE POLICY "Anyone can view profiles for guides with active tours"
ON public.guide_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.tours
    WHERE tours.guide_id = guide_profiles.user_id
    AND tours.is_active = true
  )
);