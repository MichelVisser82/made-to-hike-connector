-- Fix RLS policy for launch_signups to allow public inserts
DROP POLICY IF EXISTS "Allow anyone to sign up for launch notifications" ON public.launch_signups;

-- Create a new policy that explicitly allows both anonymous and authenticated users
CREATE POLICY "Allow public inserts to launch_signups"
ON public.launch_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);