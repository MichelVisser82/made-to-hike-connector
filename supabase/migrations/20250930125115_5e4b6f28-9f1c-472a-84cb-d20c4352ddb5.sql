-- Add RLS policy to allow admins to view all profiles
-- This allows the admin dashboard to fetch uploader information for all users
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));