-- Add guide-specific fields to launch_signups table
ALTER TABLE public.launch_signups 
ADD COLUMN regions text[] DEFAULT NULL,
ADD COLUMN certifications text[] DEFAULT NULL,
ADD COLUMN early_tester_interest boolean DEFAULT NULL;

COMMENT ON COLUMN public.launch_signups.regions IS 'Regions where guide organizes hikes';
COMMENT ON COLUMN public.launch_signups.certifications IS 'Guide certifications';
COMMENT ON COLUMN public.launch_signups.early_tester_interest IS 'Whether guide wants to be contacted for early testing';