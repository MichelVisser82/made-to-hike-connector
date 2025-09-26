-- Fix security warning: Function Search Path Mutable
-- Update the function to have a proper search_path set
CREATE OR REPLACE FUNCTION add_admin_role_if_user_exists(user_email text)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Try to find user by email in auth.users
  SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
  
  -- If user exists, add admin role
  IF user_uuid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (user_uuid, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;