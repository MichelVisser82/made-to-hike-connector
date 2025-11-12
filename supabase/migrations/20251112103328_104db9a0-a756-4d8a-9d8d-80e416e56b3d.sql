-- Phase 1-3: Comprehensive Stripe Connect improvements

-- 1. Add stripe_requirements JSONB column to guide_profiles
ALTER TABLE public.guide_profiles
ADD COLUMN IF NOT EXISTS stripe_requirements JSONB DEFAULT '{}'::jsonb;

-- 2. Add api_version and livemode to stripe_webhook_events
ALTER TABLE public.stripe_webhook_events
ADD COLUMN IF NOT EXISTS api_version TEXT,
ADD COLUMN IF NOT EXISTS livemode BOOLEAN DEFAULT true;

-- 3. Create webhook_processing_queue table for async processing
CREATE TABLE IF NOT EXISTS public.webhook_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  api_version TEXT,
  livemode BOOLEAN DEFAULT true,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON public.webhook_processing_queue(processing_status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_event_id ON public.webhook_processing_queue(event_id);

-- 4. Create stripe_balance_snapshots table for reconciliation
CREATE TABLE IF NOT EXISTS public.stripe_balance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  available_balance JSONB NOT NULL,
  pending_balance JSONB NOT NULL,
  reserved_balance JSONB,
  total_transfers NUMERIC DEFAULT 0,
  total_payouts NUMERIC DEFAULT 0,
  platform_fees_collected NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guide_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_balance_snapshots_guide ON public.stripe_balance_snapshots(guide_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_balance_snapshots_date ON public.stripe_balance_snapshots(snapshot_date DESC);

-- 5. Add account_link tracking to guide_profiles
ALTER TABLE public.guide_profiles
ADD COLUMN IF NOT EXISTS account_link_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_link_url TEXT;

COMMENT ON COLUMN public.guide_profiles.stripe_requirements IS 'Tracks Stripe account verification requirements from account.requirements object';
COMMENT ON COLUMN public.guide_profiles.account_link_expires_at IS 'Expiration timestamp for the current account link';
COMMENT ON TABLE public.webhook_processing_queue IS 'Queue for asynchronous webhook processing with retry logic';
COMMENT ON TABLE public.stripe_balance_snapshots IS 'Daily snapshots of guide Stripe balances for reconciliation';