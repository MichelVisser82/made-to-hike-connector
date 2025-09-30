-- Add SEO fields to tours table
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_tours_slug ON public.tours(slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_tour_slug(tour_title text, tour_region text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(
    regexp_replace(tour_title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  -- Trim multiple consecutive hyphens
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  
  -- Trim leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Add region for better SEO
  base_slug := base_slug || '-' || lower(tour_region);
  
  -- Limit length to 50 characters
  base_slug := left(base_slug, 50);
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.tours WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Generate slugs for existing tours
UPDATE public.tours 
SET slug = generate_tour_slug(title, region::text)
WHERE slug IS NULL;

-- Create trigger to auto-generate slugs for new tours
CREATE OR REPLACE FUNCTION auto_generate_tour_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_tour_slug(NEW.title, NEW.region::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_tour_slug
BEFORE INSERT ON public.tours
FOR EACH ROW
EXECUTE FUNCTION auto_generate_tour_slug();