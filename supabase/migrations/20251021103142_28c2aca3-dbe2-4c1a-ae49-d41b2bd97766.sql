-- Migration 2: Extend tours table with min/max group size and auto_confirm
ALTER TABLE tours ADD COLUMN IF NOT EXISTS min_group_size INTEGER DEFAULT 1;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS max_group_size INTEGER;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS auto_confirm BOOLEAN DEFAULT false;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS service_fee_percentage NUMERIC DEFAULT 10.0;

-- Update existing tours to use group_size as max_group_size if not set
UPDATE tours SET max_group_size = group_size WHERE max_group_size IS NULL;