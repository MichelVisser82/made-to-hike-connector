-- Migration: Standardize image location tags and add GPS bounds to key regions
-- Phase 1: Update existing simple location tags to hierarchical format

-- Migrate Dolomites tags
UPDATE website_images 
SET tags = array_replace(tags, 'location:dolomites', 'location:italy-dolomites')
WHERE 'location:dolomites' = ANY(tags);

-- Migrate Scotland tags
UPDATE website_images 
SET tags = array_replace(tags, 'location:scotland', 'location:scotland-highlands')
WHERE 'location:scotland' = ANY(tags);

-- Migrate Pyrenees tags
UPDATE website_images 
SET tags = array_replace(tags, 'location:pyrenees', 'location:spain-pyrenees')
WHERE 'location:pyrenees' = ANY(tags);

-- Remove duplicate tags (keep hierarchical versions only)
UPDATE website_images
SET tags = (
  SELECT array_agg(DISTINCT tag ORDER BY tag)
  FROM unnest(tags) AS tag
)
WHERE array_length(tags, 1) > 0;

-- Phase 2: Add GPS bounds to key hiking regions
-- Scotland - Highlands
UPDATE hiking_regions
SET gps_bounds = jsonb_build_object(
  'latMin', 56.0,
  'latMax', 58.7,
  'lngMin', -8.0,
  'lngMax', -2.0
)
WHERE country = 'Scotland' AND subregion = 'Highlands' AND gps_bounds IS NULL;

-- Italy - Dolomites
UPDATE hiking_regions
SET gps_bounds = jsonb_build_object(
  'latMin', 46.0,
  'latMax', 47.0,
  'lngMin', 10.5,
  'lngMax', 12.5
)
WHERE country = 'Italy' AND subregion = 'Dolomites' AND gps_bounds IS NULL;

-- Spain - Pyrenees
UPDATE hiking_regions
SET gps_bounds = jsonb_build_object(
  'latMin', 42.0,
  'latMax', 43.5,
  'lngMin', -2.0,
  'lngMax', 3.5
)
WHERE country = 'Spain' AND subregion = 'Pyrenees' AND gps_bounds IS NULL;

-- Switzerland - Alps (Central Swiss Alps)
UPDATE hiking_regions
SET gps_bounds = jsonb_build_object(
  'latMin', 46.2,
  'latMax', 47.0,
  'lngMin', 7.5,
  'lngMax', 9.0
)
WHERE country = 'Switzerland' AND subregion = 'Alps' AND gps_bounds IS NULL;

-- Norway - Lofoten Islands
UPDATE hiking_regions
SET gps_bounds = jsonb_build_object(
  'latMin', 67.8,
  'latMax', 68.5,
  'lngMin', 13.0,
  'lngMax', 15.5
)
WHERE country = 'Norway' AND subregion = 'Lofoten Islands' AND gps_bounds IS NULL;

-- France - Mont Blanc Region
UPDATE hiking_regions
SET gps_bounds = jsonb_build_object(
  'latMin', 45.7,
  'latMax', 46.0,
  'lngMin', 6.7,
  'lngMax', 7.2
)
WHERE country = 'France' AND subregion = 'Mont Blanc' AND gps_bounds IS NULL;

-- Austria - Austrian Alps (Tyrol)
UPDATE hiking_regions
SET gps_bounds = jsonb_build_object(
  'latMin', 46.8,
  'latMax', 47.5,
  'lngMin', 10.5,
  'lngMax', 12.5
)
WHERE country = 'Austria' AND subregion = 'Austrian Alps' AND gps_bounds IS NULL;