-- Create referral_links table (the shareable codes - one per referrer+target_type)
CREATE TABLE IF NOT EXISTS public.referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_type TEXT NOT NULL CHECK (referrer_type IN ('hiker', 'guide')),
  target_type TEXT NOT NULL CHECK (target_type IN ('hiker', 'guide')),
  referral_code VARCHAR NOT NULL UNIQUE,
  reward_amount NUMERIC NOT NULL,
  reward_currency VARCHAR DEFAULT 'EUR',
  reward_type TEXT NOT NULL CHECK (reward_type IN ('voucher', 'credit')),
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '2 years'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referrer_id, target_type)
);

-- Create referral_invitations table (individual email invites - many per link)
CREATE TABLE IF NOT EXISTS public.referral_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  invitation_token VARCHAR NOT NULL UNIQUE,
  referee_email TEXT NOT NULL,
  personal_message TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'clicked', 'signed_up', 'completed')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create referral_signups table (all signups via referral - tracks conversions)
CREATE TABLE IF NOT EXISTS public.referral_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES public.referral_invitations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('hiker', 'guide')),
  signup_email TEXT NOT NULL,
  signup_source TEXT NOT NULL CHECK (signup_source IN ('email_invitation', 'generic_link', 'social_share')),
  profile_created_at TIMESTAMPTZ DEFAULT now(),
  milestone_2_at TIMESTAMPTZ,
  milestone_2_type TEXT,
  milestone_2_id UUID,
  completed_at TIMESTAMPTZ,
  completion_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'issued', 'failed')),
  reward_issued_at TIMESTAMPTZ,
  voucher_code VARCHAR,
  voucher_id UUID REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  welcome_discount_code VARCHAR,
  welcome_discount_id UUID REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_links_referrer ON public.referral_links(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON public.referral_links(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_invitations_link ON public.referral_invitations(referral_link_id);
CREATE INDEX IF NOT EXISTS idx_referral_invitations_token ON public.referral_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_referral_invitations_email ON public.referral_invitations(referee_email);
CREATE INDEX IF NOT EXISTS idx_referral_signups_link ON public.referral_signups(referral_link_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_user ON public.referral_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_invitation ON public.referral_signups(invitation_id);

-- Enable RLS
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_links
CREATE POLICY "Users can view their own referral links"
  ON public.referral_links FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert their own referral links"
  ON public.referral_links FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referral links"
  ON public.referral_links FOR UPDATE
  USING (auth.uid() = referrer_id);

-- RLS Policies for referral_invitations
CREATE POLICY "Users can view invitations for their links"
  ON public.referral_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.referral_links
      WHERE id = referral_invitations.referral_link_id
      AND referrer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invitations for their links"
  ON public.referral_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.referral_links
      WHERE id = referral_link_id
      AND referrer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invitations for their links"
  ON public.referral_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.referral_links
      WHERE id = referral_invitations.referral_link_id
      AND referrer_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invitations for their links"
  ON public.referral_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.referral_links
      WHERE id = referral_invitations.referral_link_id
      AND referrer_id = auth.uid()
    )
  );

-- RLS Policies for referral_signups
CREATE POLICY "Referrers can view signups for their links"
  ON public.referral_signups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.referral_links
      WHERE id = referral_signups.referral_link_id
      AND referrer_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own signups as referee"
  ON public.referral_signups FOR SELECT
  USING (auth.uid() = user_id);

-- Migrate existing data from referrals table
INSERT INTO public.referral_links (
  referrer_id,
  referrer_type,
  target_type,
  referral_code,
  reward_amount,
  reward_currency,
  reward_type,
  click_count,
  is_active,
  expires_at,
  created_at,
  updated_at
)
SELECT DISTINCT
  referrer_id,
  referrer_type,
  target_type,
  referral_code,
  reward_amount,
  reward_currency,
  reward_type,
  click_count,
  true,
  expires_at,
  created_at,
  updated_at
FROM public.referrals
ON CONFLICT (referrer_id, target_type) DO NOTHING;

-- Migrate invitations (where referee_email exists)
INSERT INTO public.referral_invitations (
  referral_link_id,
  invitation_token,
  referee_email,
  status,
  sent_at,
  expires_at,
  created_at,
  updated_at
)
SELECT
  rl.id,
  'LEGACY_' || substring(md5(r.id::text || random()::text), 1, 10),
  r.referee_email,
  CASE
    WHEN r.referee_id IS NOT NULL THEN 'signed_up'
    WHEN r.status = 'completed' THEN 'completed'
    ELSE 'sent'
  END,
  r.created_at,
  r.expires_at,
  r.created_at,
  r.updated_at
FROM public.referrals r
JOIN public.referral_links rl ON r.referral_code = rl.referral_code
WHERE r.referee_email IS NOT NULL
ON CONFLICT (invitation_token) DO NOTHING;

-- Migrate signups (where referee_id exists)
INSERT INTO public.referral_signups (
  referral_link_id,
  invitation_id,
  user_id,
  user_type,
  signup_email,
  signup_source,
  profile_created_at,
  milestone_2_at,
  milestone_2_type,
  milestone_2_id,
  completed_at,
  completion_booking_id,
  reward_status,
  reward_issued_at,
  voucher_code,
  voucher_id,
  created_at,
  updated_at
)
SELECT
  rl.id,
  ri.id,
  r.referee_id,
  r.referee_type,
  COALESCE(p.email, r.referee_email),
  CASE WHEN r.referee_email IS NOT NULL THEN 'email_invitation' ELSE 'generic_link' END,
  r.profile_created_at,
  r.milestone_2_at,
  r.milestone_2_type,
  r.milestone_2_id,
  r.completed_at,
  r.completion_booking_id,
  COALESCE(r.reward_status, 'pending'),
  r.reward_issued_at,
  r.voucher_code,
  r.voucher_id,
  r.created_at,
  r.updated_at
FROM public.referrals r
JOIN public.referral_links rl ON r.referral_code = rl.referral_code
LEFT JOIN public.referral_invitations ri ON ri.referral_link_id = rl.id AND ri.referee_email = r.referee_email
LEFT JOIN public.profiles p ON r.referee_id = p.id
WHERE r.referee_id IS NOT NULL;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_referral_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referral_links_updated_at
  BEFORE UPDATE ON public.referral_links
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_updated_at();

CREATE TRIGGER update_referral_invitations_updated_at
  BEFORE UPDATE ON public.referral_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_updated_at();

CREATE TRIGGER update_referral_signups_updated_at
  BEFORE UPDATE ON public.referral_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_updated_at();