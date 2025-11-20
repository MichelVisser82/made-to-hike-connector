-- Phase 1: Add structured region columns to tours table
ALTER TABLE tours
ADD COLUMN IF NOT EXISTS region_country text,
ADD COLUMN IF NOT EXISTS region_region text,
ADD COLUMN IF NOT EXISTS region_subregion text;

-- Add featured region support to hiking_regions
ALTER TABLE hiking_regions
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 999;

-- Create index for fast filtering
CREATE INDEX IF NOT EXISTS idx_tours_region_structured 
ON tours(region_country, region_region, region_subregion);

-- Create index for featured regions
CREATE INDEX IF NOT EXISTS idx_hiking_regions_featured 
ON hiking_regions(is_featured, display_order) WHERE is_featured = true;

-- Backfill structured region data from existing region column
-- Parse "Country - Region - Subregion" format
UPDATE tours
SET 
  region_country = CASE 
    WHEN region LIKE '%-%-%' THEN split_part(region, ' - ', 1)
    WHEN region LIKE '%-%' THEN split_part(region, ' - ', 1)
    ELSE NULL
  END,
  region_region = CASE 
    WHEN region LIKE '%-%-%' THEN split_part(region, ' - ', 2)
    ELSE NULL
  END,
  region_subregion = CASE 
    WHEN region LIKE '%-%-%' THEN split_part(region, ' - ', 3)
    WHEN region LIKE '%-%' THEN split_part(region, ' - ', 2)
    ELSE region
  END
WHERE region IS NOT NULL;

-- Map legacy hardcoded regions
UPDATE tours
SET 
  region_country = 'Italy',
  region_region = 'Dolomites',
  region_subregion = 'Dolomites'
WHERE LOWER(region) = 'dolomites' OR region = 'Dolomites';

UPDATE tours
SET 
  region_country = 'Spain',
  region_region = 'Pyrenees',
  region_subregion = 'Pyrenees'
WHERE LOWER(region) IN ('pyrenees', 'pyrénées');

UPDATE tours
SET 
  region_country = 'Scotland',
  region_region = 'Scottish Highlands',
  region_subregion = 'Scottish Highlands'
WHERE LOWER(region) IN ('scotland', 'scottish highlands');

-- Mark popular regions as featured (Big 3 + a few more)
-- Using CTEs to select first matching region
WITH dolomites AS (
  SELECT id FROM hiking_regions 
  WHERE country = 'Italy' AND (subregion ILIKE '%Dolomites%' OR region ILIKE '%Dolomites%')
  ORDER BY id LIMIT 1
)
UPDATE hiking_regions
SET is_featured = true, display_order = 1
WHERE id IN (SELECT id FROM dolomites);

WITH pyrenees AS (
  SELECT id FROM hiking_regions 
  WHERE country = 'Spain' AND (subregion ILIKE '%Pyrenees%' OR region ILIKE '%Pyrenees%')
  ORDER BY id LIMIT 1
)
UPDATE hiking_regions
SET is_featured = true, display_order = 2
WHERE id IN (SELECT id FROM pyrenees);

WITH highlands AS (
  SELECT id FROM hiking_regions 
  WHERE country = 'Scotland' AND (subregion ILIKE '%Highland%' OR region ILIKE '%Highland%')
  ORDER BY id LIMIT 1
)
UPDATE hiking_regions
SET is_featured = true, display_order = 3
WHERE id IN (SELECT id FROM highlands);

WITH alps AS (
  SELECT id FROM hiking_regions 
  WHERE country = 'Switzerland' AND (subregion ILIKE '%Alps%' OR region ILIKE '%Alps%')
  ORDER BY id LIMIT 1
)
UPDATE hiking_regions
SET is_featured = true, display_order = 4
WHERE id IN (SELECT id FROM alps);

WITH lofoten AS (
  SELECT id FROM hiking_regions 
  WHERE country = 'Norway' AND (subregion ILIKE '%Lofoten%' OR region ILIKE '%Lofoten%')
  ORDER BY id LIMIT 1
)
UPDATE hiking_regions
SET is_featured = true, display_order = 5
WHERE id IN (SELECT id FROM lofoten);

WITH iceland AS (
  SELECT id FROM hiking_regions 
  WHERE country = 'Iceland'
  ORDER BY id LIMIT 1
)
UPDATE hiking_regions
SET is_featured = true, display_order = 6
WHERE id IN (SELECT id FROM iceland);