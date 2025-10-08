-- Fix: Remove SECURITY DEFINER from view to address security linter warning
-- The view doesn't need elevated privileges, it should respect normal RLS policies

-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.guide_profiles_public;

-- Create regular view (no SECURITY DEFINER) for public guide profiles
CREATE VIEW public.guide_profiles_public AS
SELECT 
  id,
  user_id,
  display_name,
  location,
  bio,
  profile_image_url,
  hero_background_url,
  verified,
  experience_years,
  specialties,
  certifications,
  languages_spoken,
  difficulty_levels,
  guiding_areas,
  terrain_capabilities,
  seasonal_availability,
  active_since,
  slug,
  website_url,
  facebook_url,
  instagram_url,
  intro_video_url,
  intro_video_thumbnail_url,
  daily_rate,
  daily_rate_currency,
  min_group_size,
  max_group_size,
  upcoming_availability_start,
  upcoming_availability_end,
  portfolio_images,
  profile_completed,
  onboarding_step,
  created_at,
  updated_at,
  NULL::text as phone  -- Phone is always NULL in public view for security
FROM public.guide_profiles
WHERE verified = true OR EXISTS (
  SELECT 1 FROM tours 
  WHERE tours.guide_id = guide_profiles.user_id 
  AND tours.is_active = true
);

-- Grant read access to the view
GRANT SELECT ON public.guide_profiles_public TO anon;
GRANT SELECT ON public.guide_profiles_public TO authenticated;

COMMENT ON VIEW public.guide_profiles_public IS 'Public-safe view of guide profiles that excludes sensitive phone numbers. Use this view for anonymous/public queries to prevent phone number scraping.';