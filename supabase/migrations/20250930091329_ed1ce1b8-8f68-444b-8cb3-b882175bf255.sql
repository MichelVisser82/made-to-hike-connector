-- Add missing fields to tours table for extended tour data
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS pack_weight INTEGER,
ADD COLUMN IF NOT EXISTS daily_hours TEXT,
ADD COLUMN IF NOT EXISTS terrain_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS itinerary JSONB,
ADD COLUMN IF NOT EXISTS excluded_items TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_fee NUMERIC(10,2) DEFAULT 0;