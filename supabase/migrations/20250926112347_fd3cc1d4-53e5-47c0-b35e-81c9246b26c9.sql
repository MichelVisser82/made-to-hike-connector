-- Remove hiker role from admin user and keep only admin role
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'michel@madetohike.com') 
  AND role = 'hiker';