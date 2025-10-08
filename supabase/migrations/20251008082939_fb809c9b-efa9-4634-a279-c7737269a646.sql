-- Security Fix: Implement column-level security for phone numbers
-- PostgreSQL column privileges prevent anonymous role from selecting phone column

-- Revoke SELECT permission on phone column for anonymous users
-- This is enforced at the database level and cannot be bypassed by direct API calls
REVOKE SELECT (phone) ON public.guide_profiles FROM anon;

-- Grant SELECT on phone column only to authenticated users
GRANT SELECT (phone) ON public.guide_profiles TO authenticated;

-- Verify that anon role can still SELECT other columns
-- (The existing table-level SELECT grant remains, we're just restricting one column)

COMMENT ON COLUMN public.guide_profiles.phone IS 'SECURITY: Column-level privileges restrict this field from anonymous users. Only authenticated users and admins can view phone numbers. This prevents scraping and unauthorized access to guide contact information.';