-- Add location coordinates to tours table
ALTER TABLE tours
ADD COLUMN IF NOT EXISTS meeting_point_lat NUMERIC,
ADD COLUMN IF NOT EXISTS meeting_point_lng NUMERIC,
ADD COLUMN IF NOT EXISTS meeting_point_formatted TEXT;

COMMENT ON COLUMN tours.meeting_point_lat IS 'Latitude coordinate of meeting point for map display';
COMMENT ON COLUMN tours.meeting_point_lng IS 'Longitude coordinate of meeting point for map display';
COMMENT ON COLUMN tours.meeting_point_formatted IS 'Human-readable formatted address from geocoding service';

-- Add location coordinates to guide_profiles table
ALTER TABLE guide_profiles
ADD COLUMN IF NOT EXISTS location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS location_lng NUMERIC,
ADD COLUMN IF NOT EXISTS location_formatted TEXT;

COMMENT ON COLUMN guide_profiles.location_lat IS 'Latitude coordinate of guide base location';
COMMENT ON COLUMN guide_profiles.location_lng IS 'Longitude coordinate of guide base location';
COMMENT ON COLUMN guide_profiles.location_formatted IS 'Human-readable formatted address from geocoding service';