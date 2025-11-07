-- Add country field to guide_profiles for Stripe account creation
ALTER TABLE guide_profiles 
ADD COLUMN IF NOT EXISTS country text;

COMMENT ON COLUMN guide_profiles.country IS 'ISO 3166-1 alpha-2 country code for Stripe account creation';
