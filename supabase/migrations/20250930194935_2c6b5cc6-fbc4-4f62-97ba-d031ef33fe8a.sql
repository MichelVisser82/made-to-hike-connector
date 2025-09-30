-- Add experience_years column to guide_profiles table
ALTER TABLE public.guide_profiles 
ADD COLUMN experience_years integer;

COMMENT ON COLUMN public.guide_profiles.experience_years IS 'Number of years of guiding experience';