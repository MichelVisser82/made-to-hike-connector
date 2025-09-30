-- Remove contact_email column from guide_profiles since we'll use auth.users email
ALTER TABLE guide_profiles DROP COLUMN IF EXISTS contact_email;