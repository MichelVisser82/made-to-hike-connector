-- Create hiking_regions table for verified regions
CREATE TABLE IF NOT EXISTS public.hiking_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  region TEXT,
  subregion TEXT NOT NULL,
  description TEXT NOT NULL,
  key_features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(country, region, subregion)
);

-- Create user_submitted_regions table for pending verification
CREATE TABLE IF NOT EXISTS public.user_submitted_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  region TEXT,
  subregion TEXT NOT NULL,
  description TEXT NOT NULL,
  key_features TEXT[] NOT NULL DEFAULT '{}',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CHECK (verification_status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE public.hiking_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_submitted_regions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hiking_regions
CREATE POLICY "Anyone can view active hiking regions"
  ON public.hiking_regions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage hiking regions"
  ON public.hiking_regions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text));

-- RLS Policies for user_submitted_regions
CREATE POLICY "Users can submit their own regions"
  ON public.user_submitted_regions
  FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own submissions"
  ON public.user_submitted_regions
  FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all submitted regions"
  ON public.user_submitted_regions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text));

-- Trigger for updated_at
CREATE TRIGGER update_hiking_regions_updated_at
  BEFORE UPDATE ON public.hiking_regions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_submitted_regions_updated_at
  BEFORE UPDATE ON public.user_submitted_regions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_hiking_regions_country ON public.hiking_regions(country);
CREATE INDEX idx_hiking_regions_region ON public.hiking_regions(region);
CREATE INDEX idx_user_submitted_regions_status ON public.user_submitted_regions(verification_status);
CREATE INDEX idx_user_submitted_regions_submitted_by ON public.user_submitted_regions(submitted_by);