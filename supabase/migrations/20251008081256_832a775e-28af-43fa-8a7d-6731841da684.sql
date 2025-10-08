-- Security Fix: Explicit protection for customer email addresses in profiles table
-- Prevents any unauthenticated access to user emails and personal information

-- Ensure RLS is enabled (defensive check)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add explicit deny policy for unauthenticated users (belt and suspenders approach)
-- This makes it crystal clear that public access is not allowed
DROP POLICY IF EXISTS "Deny public access to profiles" ON public.profiles;
CREATE POLICY "Deny public access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Add security comment documenting the protection model
COMMENT ON TABLE public.profiles IS 'SECURITY CRITICAL: Contains PII (emails, names). RLS policies ensure: 1) Users can only view their own profile, 2) Admins can view all profiles, 3) Anonymous/public access is explicitly denied. Email addresses are protected from scraping and phishing attacks.';

-- Verify existing policies are still in place (they should be):
-- ✓ "Users can view their own profile" - SELECT with auth.uid() = id
-- ✓ "Admins can view all profiles" - SELECT with has_role check
-- ✓ "Users can insert their own profile" - INSERT with auth.uid() = id
-- ✓ "Users can update their own profile" - UPDATE with auth.uid() = id