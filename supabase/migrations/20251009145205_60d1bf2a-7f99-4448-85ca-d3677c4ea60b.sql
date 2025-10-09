-- Grant INSERT permission to anon role on launch_signups table
-- RLS policies only work if the role has the underlying permission
GRANT INSERT ON public.launch_signups TO anon;
GRANT INSERT ON public.launch_signups TO authenticated;

-- Also grant USAGE on the sequence for the id column if it exists
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;