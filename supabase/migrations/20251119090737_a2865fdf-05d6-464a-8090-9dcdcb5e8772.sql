-- Remove duplicate hiking regions
-- Keep the older entries (created at 10:20:22) and delete the newer duplicates (created at 10:35:11)

DELETE FROM hiking_regions 
WHERE created_at = '2025-11-04 10:35:11.003086+00:00';