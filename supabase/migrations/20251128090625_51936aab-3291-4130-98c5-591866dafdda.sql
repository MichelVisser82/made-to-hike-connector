-- Phase 1: Referral System Database Schema

-- 1.1 Create referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referrer (person who shared the link)
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referrer_type TEXT NOT NULL CHECK (referrer_type IN ('hiker', 'guide')),
  
  -- Referee (person who was invited)
  referee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referee_email TEXT,
  referee_type TEXT CHECK (referee_type IN ('hiker', 'guide')),
  
  -- Referral tracking
  referral_code VARCHAR(100) UNIQUE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('hiker', 'guide')),
  
  -- Progress tracking (3-step milestone)
  status TEXT DEFAULT 'link_sent' CHECK (status IN ('link_sent', 'profile_created', 'milestone_2', 'completed', 'expired')),
  
  -- Milestone timestamps
  profile_created_at TIMESTAMPTZ,
  milestone_2_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Milestone details
  milestone_2_type TEXT, -- 'first_booking' for hikers, 'first_tour_published' for guides
  milestone_2_id UUID,   -- booking_id or tour_id
  completion_booking_id UUID,
  
  -- Reward info
  reward_amount DECIMAL(10,2),
  reward_currency VARCHAR(3) DEFAULT 'EUR',
  reward_type TEXT NOT NULL CHECK (reward_type IN ('voucher', 'credit')),
  reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'issued', 'cancelled')),
  reward_issued_at TIMESTAMPTZ,
  
  -- Voucher details (if referrer is hiker)
  voucher_code VARCHAR(50),
  voucher_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL,
  
  -- Fraud prevention
  click_count INT DEFAULT 0,
  is_suspicious BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

-- Add indexes for referrals
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Add trigger for updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 1.2 Create user_credits table (For Guides)
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  source_type TEXT NOT NULL CHECK (source_type IN ('referral_reward', 'welcome_bonus', 'promo', 'refund', 'manual', 'withdrawal')),
  source_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'withdrawn')),
  used_at TIMESTAMPTZ,
  used_on_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  withdrawn_at TIMESTAMPTZ,
  withdrawal_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for user_credits
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_user_credits_status ON user_credits(user_id, status);

-- 1.3 Extend discount_codes table
ALTER TABLE discount_codes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'referral_reward', 'promo', 'compensation')),
ADD COLUMN IF NOT EXISTS source_id UUID,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- 1.4 Create discount_code_usage table
CREATE TABLE discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  booking_total_before DECIMAL(10,2),
  booking_total_after DECIMAL(10,2),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for discount_code_usage
CREATE INDEX idx_discount_code_usage_code ON discount_code_usage(discount_code_id);
CREATE INDEX idx_discount_code_usage_user ON discount_code_usage(user_id);
CREATE INDEX idx_discount_code_usage_booking ON discount_code_usage(booking_id);

-- 1.5 RLS Policies for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals as referrer"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals where they are referee"
  ON referrals FOR SELECT
  USING (auth.uid() = referee_id);

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 1.6 RLS Policies for user_credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all credits"
  ON user_credits FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 1.7 RLS Policies for discount_code_usage
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own discount code usage"
  ON discount_code_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Guides can view discount usage for their tours"
  ON discount_code_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN tours t ON t.id = b.tour_id
      WHERE b.id = discount_code_usage.booking_id
      AND t.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all discount code usage"
  ON discount_code_usage FOR SELECT
  USING (has_role(auth.uid(), 'admin'));