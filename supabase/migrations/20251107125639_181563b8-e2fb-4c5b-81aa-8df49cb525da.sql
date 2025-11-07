-- Add address fields to guide_profiles for Stripe Connect
ALTER TABLE public.guide_profiles
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS address_city TEXT,
ADD COLUMN IF NOT EXISTS address_state TEXT,
ADD COLUMN IF NOT EXISTS address_postal_code TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

COMMENT ON COLUMN public.guide_profiles.address_line1 IS 'Street address for Stripe Connect account';
COMMENT ON COLUMN public.guide_profiles.address_city IS 'City for Stripe Connect account';
COMMENT ON COLUMN public.guide_profiles.address_state IS 'State/Province for Stripe Connect account';
COMMENT ON COLUMN public.guide_profiles.address_postal_code IS 'Postal/ZIP code for Stripe Connect account';
COMMENT ON COLUMN public.guide_profiles.date_of_birth IS 'Date of birth for Stripe Connect verification';