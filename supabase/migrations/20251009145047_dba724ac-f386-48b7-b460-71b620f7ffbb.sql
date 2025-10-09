-- Drop all existing policies on launch_signups
DROP POLICY IF EXISTS "Anyone can sign up to waitlist" ON public.launch_signups;
DROP POLICY IF EXISTS "Only admins can view signups" ON public.launch_signups;
DROP POLICY IF EXISTS "Allow public inserts to launch_signups" ON public.launch_signups;
DROP POLICY IF EXISTS "Admins can view all signups" ON public.launch_signups;

-- Create INSERT policy explicitly for anon and authenticated roles
CREATE POLICY "enable_insert_for_anon_users"
ON public.launch_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin SELECT policy
CREATE POLICY "enable_select_for_admins"
ON public.launch_signups
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));