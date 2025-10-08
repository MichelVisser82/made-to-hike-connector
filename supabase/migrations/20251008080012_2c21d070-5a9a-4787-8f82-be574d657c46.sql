-- Security Fix: Protect guide phone numbers from public exposure
-- Remove overly permissive public SELECT policy that exposes all guide data including phone numbers

-- Drop the policy that allows anyone to view verified guide profiles (too broad)
DROP POLICY IF EXISTS "Anyone can view verified guide profiles" ON public.guide_profiles;

-- Update the active tours policy to require authentication
DROP POLICY IF EXISTS "Anyone can view profiles for guides with active tours" ON public.guide_profiles;

CREATE POLICY "Authenticated users can view profiles for guides with active tours"
ON public.guide_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tours
    WHERE tours.guide_id = guide_profiles.user_id
      AND tours.is_active = true
  )
);

-- Add policy for authenticated users to view verified guide profiles
CREATE POLICY "Authenticated users can view verified guide profiles"
ON public.guide_profiles
FOR SELECT
TO authenticated
USING (verified = true);

-- Note: Guides and admins can still view profiles through their existing policies:
-- - "Guides can view their own profile" (auth.uid() = user_id)
-- - "Admins can manage all guide profiles" (has_role(auth.uid(), 'admin'))

COMMENT ON TABLE public.guide_profiles IS 'Guide profiles with protected contact information. Phone numbers are only accessible to authenticated users.';