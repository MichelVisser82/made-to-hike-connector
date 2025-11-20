-- Add GPS bounds column to hiking_regions for location-based tagging
ALTER TABLE public.hiking_regions
ADD COLUMN IF NOT EXISTS gps_bounds jsonb DEFAULT NULL;

-- Add example GPS bounds for some well-known regions
-- Scotland
UPDATE public.hiking_regions
SET gps_bounds = '{"latMin": 56.0, "latMax": 58.7, "lngMin": -8.0, "lngMax": -2.0}'
WHERE country = 'United Kingdom' 
  AND region = 'Scotland'
  AND subregion IN ('Scottish Highlands', 'Cairngorms', 'West Highlands');

-- Dolomites
UPDATE public.hiking_regions
SET gps_bounds = '{"latMin": 46.0, "latMax": 47.0, "lngMin": 10.5, "lngMax": 12.5}'
WHERE country = 'Italy' 
  AND region = 'Dolomites';

-- Pyrenees
UPDATE public.hiking_regions
SET gps_bounds = '{"latMin": 42.0, "latMax": 43.5, "lngMin": -2.0, "lngMax": 3.5}'
WHERE (country = 'Spain' OR country = 'France' OR country = 'Andorra')
  AND region = 'Pyrenees';