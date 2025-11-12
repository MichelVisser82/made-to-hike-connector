-- Enable RLS on new tables created in previous migration

ALTER TABLE public.webhook_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_balance_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_processing_queue (admin only)
CREATE POLICY "Admins can view webhook queue"
  ON public.webhook_processing_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for stripe_balance_snapshots (guides can view their own, admins can view all)
CREATE POLICY "Guides can view their own balance snapshots"
  ON public.stripe_balance_snapshots
  FOR SELECT
  USING (auth.uid() = guide_id);

CREATE POLICY "Admins can view all balance snapshots"
  ON public.stripe_balance_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert balance snapshots"
  ON public.stripe_balance_snapshots
  FOR INSERT
  WITH CHECK (true);