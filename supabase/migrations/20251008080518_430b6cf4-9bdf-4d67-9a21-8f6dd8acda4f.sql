-- Security Fix: Restrict user_roles table to authenticated users only
-- This prevents attackers from identifying high-value admin accounts for phishing attacks

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

-- Add policy requiring authentication to view roles
CREATE POLICY "Authenticated users can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- Add helpful comment explaining the security model
COMMENT ON TABLE public.user_roles IS 'SECURITY: User roles are sensitive data. Only authenticated users can query this table to prevent attackers from identifying high-value targets like admins. Admins can manage roles, authenticated users can view roles.';

-- Security rationale:
-- 1. Prevents unauthenticated enumeration of admin accounts
-- 2. Reduces risk of targeted phishing attacks
-- 3. Maintains necessary functionality for authenticated users to see roles
-- 4. Admin management policy remains unchanged (has_role check)