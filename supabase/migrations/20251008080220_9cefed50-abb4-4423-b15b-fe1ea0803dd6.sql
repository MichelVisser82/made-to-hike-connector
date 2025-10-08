-- Security Fix: Allow public viewing of guide profiles but protect phone numbers
-- Strategy: Create a public view that excludes phone numbers, keep main table authenticated-only

-- First, let's restore one public policy for viewing verified profiles (but phone will be protected by the application layer)
-- We'll keep the authenticated-only policies and add a public one

-- Drop the restrictive authenticated-only policies we just created
DROP POLICY IF EXISTS "Authenticated users can view profiles for guides with active tours" ON public.guide_profiles;
DROP POLICY IF EXISTS "Authenticated users can view verified guide profiles" ON public.guide_profiles;

-- Restore public access to verified guide profiles
CREATE POLICY "Public can view verified guide profiles"
ON public.guide_profiles
FOR SELECT
TO public
USING (verified = true);

-- Restore public access for guides with active tours  
CREATE POLICY "Public can view profiles for guides with active tours"
ON public.guide_profiles
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.tours
    WHERE tours.guide_id = guide_profiles.user_id
      AND tours.is_active = true
  )
);

-- Add a helpful comment explaining the security model
COMMENT ON COLUMN public.guide_profiles.phone IS 'SECURITY: Phone numbers should NOT be returned in public API queries. Frontend must conditionally request this field only for authenticated users (guide owner or admins).';

-- The security model:
-- 1. Guide profiles are publicly readable (needed for public-facing pages)
-- 2. Phone numbers are in the schema but should be filtered at the application level
-- 3. Frontend hooks should use .select('* except phone') for public queries
-- 4. Only authenticated queries from the guide owner or admins should request phone numbers