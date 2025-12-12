-- Add badge_type and pioneer_number columns to guide_profiles
ALTER TABLE public.guide_profiles
ADD COLUMN badge_type TEXT CHECK (badge_type IN ('founder', 'pioneer-guide')),
ADD COLUMN pioneer_number INTEGER CHECK (pioneer_number >= 1 AND pioneer_number <= 50);