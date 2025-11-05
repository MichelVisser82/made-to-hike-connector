-- Add average_distance_per_day_km column to tours table
ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS average_distance_per_day_km NUMERIC;