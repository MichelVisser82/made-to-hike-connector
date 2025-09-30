-- Add missing tour detail fields for better data population
ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS distance_km numeric,
ADD COLUMN IF NOT EXISTS elevation_gain_m integer;

COMMENT ON COLUMN public.tours.distance_km IS 'Total distance of the tour in kilometers';
COMMENT ON COLUMN public.tours.elevation_gain_m IS 'Total elevation gain in meters';