-- Fix search_path for slug generation functions (drop trigger first)
DROP TRIGGER IF EXISTS trigger_auto_generate_tour_slug ON public.tours;
DROP FUNCTION IF EXISTS auto_generate_tour_slug();
DROP FUNCTION IF EXISTS generate_tour_slug(text, text);

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION generate_tour_slug(tour_title text, tour_region text)
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
  base_slug := lower(regexp_replace(
    regexp_replace(tour_title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  base_slug := base_slug || '-' || lower(tour_region);
  base_slug := left(base_slug, 50);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.tours WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION auto_generate_tour_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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