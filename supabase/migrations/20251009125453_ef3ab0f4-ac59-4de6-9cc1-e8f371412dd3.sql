-- Fix launch_signups RLS policy to allow both authenticated and anonymous inserts
DROP POLICY IF EXISTS "Anyone can sign up for launch notifications" ON public.launch_signups;

CREATE POLICY "Allow anyone to sign up for launch notifications"
ON public.launch_signups
FOR INSERT
TO public
WITH CHECK (true);