-- Add location tags to existing images based on their current tags and descriptions
UPDATE website_images 
SET tags = array_append(tags, 'location:dolomites')
WHERE (
  'dolomites' = ANY(tags) OR 
  lower(description) LIKE '%dolomite%' OR 
  lower(file_name) LIKE '%dolomite%' OR
  lower(alt_text) LIKE '%dolomite%'
) AND NOT ('location:dolomites' = ANY(tags));

-- Update images that appear to be from Scotland/Highlands
UPDATE website_images 
SET tags = array_append(tags, 'location:scotland')
WHERE (
  'scotland' = ANY(tags) OR 
  'highlands' = ANY(tags) OR
  'highland' = ANY(tags) OR
  lower(description) LIKE '%scotland%' OR 
  lower(description) LIKE '%highland%' OR
  lower(file_name) LIKE '%scotland%' OR
  lower(file_name) LIKE '%highland%' OR
  lower(alt_text) LIKE '%scotland%' OR
  lower(alt_text) LIKE '%highland%'
) AND NOT ('location:scotland' = ANY(tags));

-- Update images that appear to be from Pyrenees
UPDATE website_images 
SET tags = array_append(tags, 'location:pyrenees')
WHERE (
  'pyrenees' = ANY(tags) OR 
  lower(description) LIKE '%pyrenees%' OR 
  lower(file_name) LIKE '%pyrenees%' OR
  lower(alt_text) LIKE '%pyrenees%'
) AND NOT ('location:pyrenees' = ANY(tags));

-- For any remaining images without location tags, we'll analyze them case by case
-- This query helps identify images that still need location tagging
SELECT id, file_name, description, tags 
FROM website_images 
WHERE NOT (
  'location:dolomites' = ANY(tags) OR 
  'location:scotland' = ANY(tags) OR 
  'location:pyrenees' = ANY(tags)
);