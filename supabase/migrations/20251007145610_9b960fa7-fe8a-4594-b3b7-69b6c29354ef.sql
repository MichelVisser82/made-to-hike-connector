-- Update existing tours to populate denormalized guide data
UPDATE public.tours t
SET 
  guide_display_name = gp.display_name,
  guide_avatar_url = gp.profile_image_url
FROM public.guide_profiles gp
WHERE t.guide_id = gp.user_id
  AND (t.guide_display_name IS NULL OR t.guide_avatar_url IS NULL);