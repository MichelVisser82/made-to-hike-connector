-- Add video introduction fields to guide_profiles table
ALTER TABLE public.guide_profiles
ADD COLUMN intro_video_url text,
ADD COLUMN intro_video_thumbnail_url text;

COMMENT ON COLUMN public.guide_profiles.intro_video_url IS 'URL to guide introduction video (YouTube, Vimeo, or direct link)';
COMMENT ON COLUMN public.guide_profiles.intro_video_thumbnail_url IS 'Optional custom thumbnail URL for the introduction video';