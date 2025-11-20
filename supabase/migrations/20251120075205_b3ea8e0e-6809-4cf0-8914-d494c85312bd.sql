-- Add is_custom_tour column to tours table
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS is_custom_tour BOOLEAN DEFAULT false NOT NULL;

-- Update existing custom tours (tours linked to tour_offers)
UPDATE tours
SET is_custom_tour = true
WHERE id IN (SELECT DISTINCT tour_id FROM tour_offers WHERE tour_id IS NOT NULL);

-- Add index for performance on custom tour queries
CREATE INDEX IF NOT EXISTS idx_tours_is_custom_tour ON tours(is_custom_tour);

-- Add composite index for Find Tours public queries
CREATE INDEX IF NOT EXISTS idx_tours_active_custom ON tours(is_active, is_custom_tour) WHERE is_active = true;