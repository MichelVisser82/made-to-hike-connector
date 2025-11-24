-- Add packing_list column to tours table
ALTER TABLE tours ADD COLUMN IF NOT EXISTS packing_list JSONB DEFAULT NULL;

COMMENT ON COLUMN tours.packing_list IS 'Stores packing list configuration including preset, custom items, and guide notes';
