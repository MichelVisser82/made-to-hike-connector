-- Create admin user with role
-- Note: The actual user signup will need to be done manually in Supabase Auth
-- This migration just sets up the role system for the admin user

-- Insert admin role for michel@madetohike.com
-- We'll use a known UUID for this admin user that we'll create manually
-- The UUID will be: 00000000-0000-0000-0000-000000000001 (placeholder until user is created)

-- Create a function to safely add admin role when the user exists
CREATE OR REPLACE FUNCTION add_admin_role_if_user_exists(user_email text)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This function will be called after the admin user is created manually