-- Update remaining images that appear to be from Scotland based on descriptions and tags
UPDATE website_images 
SET tags = array_append(tags, 'location:scotland')
WHERE (
  'scottish highlands' = ANY(tags) OR 
  'highland trail' = ANY(tags) OR
  'Scottish hills' = ANY(tags) OR
  'scottish highlands' = ANY(tags) OR
  lower(description) LIKE '%scottish%' OR
  lower(description) LIKE '%scots pine%' OR
  lower(description) LIKE '%moorland%' OR
  lower(description) LIKE '%granite tor%'
) AND NOT ('location:scotland' = ANY(tags) OR 'location:dolomites' = ANY(tags) OR 'location:pyrenees' = ANY(tags));

-- Update images that appear to be general alpine/mountain scenes to Dolomites (since most existing images are from there)
UPDATE website_images 
SET tags = array_append(tags, 'location:dolomites')
WHERE (
  'alpine' = ANY(tags) OR 
  'mountain peaks' = ANY(tags) OR
  'limestone' = ANY(tags) OR
  lower(description) LIKE '%alpine%' OR
  lower(description) LIKE '%limestone%'
) AND NOT ('location:scotland' = ANY(tags) OR 'location:dolomites' = ANY(tags) OR 'location:pyrenees' = ANY(tags));