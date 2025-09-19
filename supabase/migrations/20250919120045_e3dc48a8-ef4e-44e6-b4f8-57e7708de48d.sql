-- Create sample test users for demonstration
-- Note: In production, users would register through the auth system

-- First, create a test admin user
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@madetohike.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID for reference
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@madetohike.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert admin profile (will be handled by trigger)
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (admin_user_id, 'admin') 
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;