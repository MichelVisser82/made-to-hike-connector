-- Add 'join' to reserved slugs to prevent routing conflicts
INSERT INTO public.reserved_slugs (slug, description)
VALUES ('join', 'Reserved for hiker referral signup page')
ON CONFLICT (slug) DO NOTHING;