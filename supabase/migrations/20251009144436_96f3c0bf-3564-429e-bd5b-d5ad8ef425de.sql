-- Fix the launch_signups INSERT policy to work with Supabase's role system
DROP POLICY IF EXISTS "Allow all inserts to launch_signups" ON public.launch_signups;

-- Create policy that explicitly allows both anonymous and authenticated users
CREATE POLICY "Allow public inserts to launch_signups" 
ON public.launch_signups 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);