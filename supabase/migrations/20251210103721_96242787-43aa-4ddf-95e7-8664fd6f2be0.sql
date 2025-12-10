-- Create public_tour_requests table for marketplace requests
CREATE TABLE public.public_tour_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  trip_name text NOT NULL,
  region text NOT NULL,
  preferred_dates text NOT NULL,
  duration text NOT NULL,
  group_size text NOT NULL,
  experience_level text NOT NULL,
  budget_per_person text,
  description text NOT NULL,
  special_requests text[] DEFAULT '{}',
  additional_details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'expired')),
  assigned_guide_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create guide_request_responses table to track guide interactions
CREATE TABLE public.guide_request_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.public_tour_requests(id) ON DELETE CASCADE,
  guide_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_type text NOT NULL CHECK (response_type IN ('interested', 'declined', 'forwarded')),
  forwarded_to_email text,
  decline_reason text,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(request_id, guide_id)
);

-- Enable RLS
ALTER TABLE public.public_tour_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_request_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for public_tour_requests
-- Anyone can submit a request (public form)
CREATE POLICY "Anyone can create public tour requests"
  ON public.public_tour_requests
  FOR INSERT
  WITH CHECK (true);

-- Requesters can view their own requests
CREATE POLICY "Requesters can view their own requests"
  ON public.public_tour_requests
  FOR SELECT
  USING (
    auth.uid() = requester_id OR
    -- Verified guides can see open requests
    (status = 'open' AND EXISTS (
      SELECT 1 FROM public.guide_profiles gp
      WHERE gp.user_id = auth.uid() AND gp.verified = true
    )) OR
    -- Admins can see all
    has_role(auth.uid(), 'admin')
  );

-- Admins can update requests
CREATE POLICY "Admins can update public tour requests"
  ON public.public_tour_requests
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for guide_request_responses
-- Guides can create responses
CREATE POLICY "Guides can create responses"
  ON public.guide_request_responses
  FOR INSERT
  WITH CHECK (
    auth.uid() = guide_id AND
    EXISTS (
      SELECT 1 FROM public.guide_profiles gp
      WHERE gp.user_id = auth.uid() AND gp.verified = true
    )
  );

-- Guides can view their own responses
CREATE POLICY "Guides can view their own responses"
  ON public.guide_request_responses
  FOR SELECT
  USING (
    auth.uid() = guide_id OR
    has_role(auth.uid(), 'admin')
  );

-- Add indexes for performance
CREATE INDEX idx_public_tour_requests_status ON public.public_tour_requests(status);
CREATE INDEX idx_public_tour_requests_region ON public.public_tour_requests(region);
CREATE INDEX idx_public_tour_requests_created_at ON public.public_tour_requests(created_at DESC);
CREATE INDEX idx_guide_request_responses_request_id ON public.guide_request_responses(request_id);
CREATE INDEX idx_guide_request_responses_guide_id ON public.guide_request_responses(guide_id);

-- Add trigger for updated_at
CREATE TRIGGER update_public_tour_requests_updated_at
  BEFORE UPDATE ON public.public_tour_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();