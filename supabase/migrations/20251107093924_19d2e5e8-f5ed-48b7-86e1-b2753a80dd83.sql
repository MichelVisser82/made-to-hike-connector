-- Create stripe_transfers table
CREATE TABLE IF NOT EXISTS public.stripe_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  stripe_transfer_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  destination_account_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transferred_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create stripe_payouts table
CREATE TABLE IF NOT EXISTS public.stripe_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  stripe_payout_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  arrival_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT,
  destination_bank_last4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create stripe_webhook_events table
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stripe_transfers_booking_id ON public.stripe_transfers(booking_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transfers_guide_id ON public.stripe_transfers(guide_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transfers_status ON public.stripe_transfers(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payouts_guide_id ON public.stripe_payouts(guide_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payouts_status ON public.stripe_payouts(status);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON public.stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON public.stripe_webhook_events(processed);

-- Enable RLS
ALTER TABLE public.stripe_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_transfers
CREATE POLICY "Guides can view their own transfers"
  ON public.stripe_transfers
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.guide_profiles WHERE id = guide_id));

CREATE POLICY "Admins can view all transfers"
  ON public.stripe_transfers
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- RLS Policies for stripe_payouts
CREATE POLICY "Guides can view their own payouts"
  ON public.stripe_payouts
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.guide_profiles WHERE id = guide_id));

CREATE POLICY "Admins can view all payouts"
  ON public.stripe_payouts
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- RLS Policies for stripe_webhook_events (admins only)
CREATE POLICY "Admins can view webhook events"
  ON public.stripe_webhook_events
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));