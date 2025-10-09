-- Temporarily disable RLS on launch_signups table to allow public inserts
-- This is safe for a pre-launch waitlist form
ALTER TABLE public.launch_signups DISABLE ROW LEVEL SECURITY;

-- Keep the SELECT policy on a different approach: re-enable RLS with proper policies
ALTER TABLE public.launch_signups ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public inserts to launch_signups" ON public.launch_signups;
DROP POLICY IF EXISTS "Allow all inserts to launch_signups" ON public.launch_signups;
DROP POLICY IF EXISTS "Admins can view all signups" ON public.launch_signups;

-- Create a simple, permissive INSERT policy for everyone
CREATE POLICY "Anyone can sign up to waitlist"
ON public.launch_signups
FOR INSERT
WITH CHECK (true);

-- Keep admin-only SELECT for privacy
CREATE POLICY "Only admins can view signups"
ON public.launch_signups
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));