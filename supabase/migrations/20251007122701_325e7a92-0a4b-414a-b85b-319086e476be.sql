-- Add slug column to guide_profiles table
ALTER TABLE public.guide_profiles
ADD COLUMN slug text UNIQUE;

CREATE INDEX idx_guide_profiles_slug ON public.guide_profiles(slug);

-- Create reserved slugs table
CREATE TABLE public.reserved_slugs (
  slug text PRIMARY KEY,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on reserved_slugs
ALTER TABLE public.reserved_slugs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reserved slugs
CREATE POLICY "Anyone can view reserved slugs"
ON public.reserved_slugs
FOR SELECT
USING (true);

-- Only admins can manage reserved slugs
CREATE POLICY "Admins can manage reserved slugs"
ON public.reserved_slugs
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Insert reserved slugs
INSERT INTO public.reserved_slugs (slug, description) VALUES
  ('admin', 'Admin dashboard'),
  ('auth', 'Authentication pages'),
  ('tours', 'Tours listing/search'),
  ('guide', 'Guide signup flow'),
  ('guides', 'Legacy guide profile URLs'),
  ('verify-email', 'Email verification'),
  ('email-test', 'Email testing'),
  ('certifications', 'Certifications info page'),
  ('about', 'About page (future)'),
  ('contact', 'Contact page (future)'),
  ('terms', 'Terms of service (future)'),
  ('privacy', 'Privacy policy (future)'),
  ('blog', 'Blog (future)'),
  ('help', 'Help center (future)'),
  ('faq', 'FAQ page (future)'),
  ('api', 'API endpoints (future)'),
  ('settings', 'User settings (future)');

-- Function to generate slug from display_name
CREATE OR REPLACE FUNCTION generate_guide_slug(guide_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase, remove special chars, remove spaces
  base_slug := lower(regexp_replace(
    regexp_replace(guide_name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '', 'g'
  ));
  
  -- Remove hyphens and trim
  base_slug := regexp_replace(base_slug, '-+', '', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Limit to 30 characters
  base_slug := left(base_slug, 30);
  final_slug := base_slug;
  
  -- Check against reserved slugs first
  IF EXISTS (SELECT 1 FROM public.reserved_slugs WHERE slug = final_slug) THEN
    final_slug := base_slug || '-guide';
  END IF;
  
  -- Handle duplicates with numerical suffix
  WHILE EXISTS (SELECT 1 FROM public.guide_profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Auto-generate slug trigger for new guides
CREATE OR REPLACE FUNCTION auto_generate_guide_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_guide_slug(NEW.display_name);
  ELSE
    -- Validate custom slug isn't reserved
    IF EXISTS (SELECT 1 FROM public.reserved_slugs WHERE slug = NEW.slug) THEN
      RAISE EXCEPTION 'Slug "%" is reserved and cannot be used', NEW.slug;
    END IF;
    
    -- Sanitize custom slug
    NEW.slug := lower(regexp_replace(
      regexp_replace(NEW.slug, '[^a-zA-Z0-9-]', '', 'g'),
      '-+', '-', 'g'
    ));
    NEW.slug := trim(both '-' from NEW.slug);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_guide_profile
BEFORE INSERT ON public.guide_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_guide_slug();

CREATE TRIGGER before_update_guide_slug
BEFORE UPDATE OF slug ON public.guide_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_guide_slug();

-- Backfill slugs for existing guides
UPDATE public.guide_profiles
SET slug = generate_guide_slug(display_name)
WHERE slug IS NULL;