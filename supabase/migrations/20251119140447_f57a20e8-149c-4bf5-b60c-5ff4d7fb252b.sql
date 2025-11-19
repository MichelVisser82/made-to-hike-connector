-- Create tour_offers table
CREATE TABLE IF NOT EXISTS public.tour_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  guide_id UUID REFERENCES public.profiles(id) NOT NULL,
  hiker_id UUID REFERENCES public.profiles(id),
  hiker_email TEXT NOT NULL,
  offer_status TEXT DEFAULT 'pending' CHECK (offer_status IN ('pending', 'payment_pending', 'accepted', 'declined', 'expired')),
  
  -- Pricing
  price_per_person NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Tour details
  duration TEXT NOT NULL,
  preferred_date DATE,
  group_size INTEGER NOT NULL,
  
  -- Meeting details
  meeting_point TEXT NOT NULL,
  meeting_time TEXT NOT NULL,
  
  -- Content
  itinerary TEXT NOT NULL,
  included_items TEXT NOT NULL,
  personal_note TEXT,
  
  -- Booking link
  booking_id UUID REFERENCES public.bookings(id),
  
  -- Security
  offer_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.tour_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Guides can insert their own offers"
  ON public.tour_offers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Guides can view their offers"
  ON public.tour_offers FOR SELECT
  TO authenticated
  USING (auth.uid() = guide_id);

CREATE POLICY "Hikers can view offers sent to them"
  ON public.tour_offers FOR SELECT
  TO authenticated
  USING (auth.uid() = hiker_id OR hiker_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can update offers"
  ON public.tour_offers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all offers"
  ON public.tour_offers FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_tour_offers_conversation ON public.tour_offers(conversation_id);
CREATE INDEX idx_tour_offers_token ON public.tour_offers(offer_token);
CREATE INDEX idx_tour_offers_status ON public.tour_offers(offer_status);
CREATE INDEX idx_tour_offers_guide ON public.tour_offers(guide_id);

-- Add trigger for updated_at
CREATE TRIGGER update_tour_offers_updated_at
  BEFORE UPDATE ON public.tour_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();