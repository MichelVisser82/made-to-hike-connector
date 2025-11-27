-- Add phone_country field to guide_profiles table
ALTER TABLE guide_profiles 
ADD COLUMN IF NOT EXISTS phone_country text;

COMMENT ON COLUMN guide_profiles.phone_country IS 'Phone country dialing code (e.g., +31, +43, +1) for guide contact number';