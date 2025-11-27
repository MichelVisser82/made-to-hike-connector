-- Update Black Forest region to remove German translation for consistency
UPDATE hiking_regions 
SET subregion = 'Black Forest'
WHERE country = 'Germany' 
  AND subregion = 'Black Forest (Schwarzwald)';