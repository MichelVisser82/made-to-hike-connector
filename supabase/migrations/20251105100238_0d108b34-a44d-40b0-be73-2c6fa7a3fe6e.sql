-- Add status column to tours table for draft/published state
ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';

-- Add check constraint to ensure valid status values
ALTER TABLE public.tours
ADD CONSTRAINT tours_status_check 
CHECK (status IN ('draft', 'published', 'archived'));

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_tours_status ON public.tours(status);