-- Drop the existing INSERT policy that uses anon/authenticated roles
DROP POLICY IF EXISTS "Allow public inserts to launch_signups" ON public.launch_signups;

-- Create a new policy that uses the PostgreSQL public role
-- This allows ALL database connections to insert, regardless of Supabase auth state
CREATE POLICY "Allow all inserts to launch_signups" 
ON public.launch_signups 
FOR INSERT 
TO public
WITH CHECK (true);

-- Keep the admin SELECT policy for data protection
-- (This should already exist, but we're being explicit)
DROP POLICY IF EXISTS "Admins can view all signups" ON public.launch_signups;

CREATE POLICY "Admins can view all signups" 
ON public.launch_signups 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));