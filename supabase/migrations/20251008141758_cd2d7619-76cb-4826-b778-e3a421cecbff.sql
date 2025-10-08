-- Create launch_signups table for email collection during pre-launch
CREATE TABLE public.launch_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('guide', 'hiker')),
  source_section TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.launch_signups ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for waitlist signups (no auth required)
CREATE POLICY "Anyone can sign up for launch notifications"
ON public.launch_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view signups
CREATE POLICY "Admins can view all signups"
ON public.launch_signups
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index on email for faster duplicate checks
CREATE INDEX idx_launch_signups_email ON public.launch_signups(email);

-- Create index on created_at for sorting
CREATE INDEX idx_launch_signups_created_at ON public.launch_signups(created_at DESC);