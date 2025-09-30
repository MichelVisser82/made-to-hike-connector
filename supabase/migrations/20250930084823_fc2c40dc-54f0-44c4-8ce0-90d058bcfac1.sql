-- Add guide role for guide@madetohike.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('fff8cf91-e3e2-4dbd-b54f-bb3fa822542b', 'guide'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;