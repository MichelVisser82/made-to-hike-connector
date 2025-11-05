-- Add cancellation policy and discount settings to guide_profiles
ALTER TABLE guide_profiles
ADD COLUMN IF NOT EXISTS cancellation_approach text DEFAULT 'single',
ADD COLUMN IF NOT EXISTS cancellation_policy_type text DEFAULT 'flexible',
ADD COLUMN IF NOT EXISTS early_bird_settings jsonb DEFAULT '{"enabled": false, "tier1_days": 60, "tier1_percent": 10, "tier2_days": 30, "tier2_percent": 7, "tier3_days": 14, "tier3_percent": 5}'::jsonb,
ADD COLUMN IF NOT EXISTS group_discount_settings jsonb DEFAULT '{"enabled": false, "tier1_min": 2, "tier1_max": 3, "tier1_percent": 5, "tier2_min": 4, "tier2_max": 5, "tier2_percent": 10, "tier3_min": 6, "tier3_percent": 15}'::jsonb,
ADD COLUMN IF NOT EXISTS last_minute_settings jsonb DEFAULT '{"enabled": false, "hours": 72, "percent": 10}'::jsonb,
ADD COLUMN IF NOT EXISTS deposit_type text DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 30,
ADD COLUMN IF NOT EXISTS final_payment_days integer DEFAULT 14;

-- Add comments for documentation
COMMENT ON COLUMN guide_profiles.cancellation_approach IS 'Either "single" (one policy for all) or "customer_choice" (3 tiers)';
COMMENT ON COLUMN guide_profiles.cancellation_policy_type IS 'flexible, moderate, strict, or non_refundable';
COMMENT ON COLUMN guide_profiles.early_bird_settings IS 'Early bird discount tiers configuration';
COMMENT ON COLUMN guide_profiles.group_discount_settings IS 'Group size discount tiers configuration';
COMMENT ON COLUMN guide_profiles.last_minute_settings IS 'Last minute discount configuration';
COMMENT ON COLUMN guide_profiles.deposit_type IS 'Either "percentage" or "fixed"';
COMMENT ON COLUMN guide_profiles.deposit_amount IS 'Percentage (10-50) or fixed amount in EUR';
COMMENT ON COLUMN guide_profiles.final_payment_days IS 'Days before tour when final payment is due (7-60)';

-- Add per-tour override settings to tours table
ALTER TABLE tours
ADD COLUMN IF NOT EXISTS using_default_cancellation boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_cancellation_approach text,
ADD COLUMN IF NOT EXISTS custom_cancellation_policy_type text,
ADD COLUMN IF NOT EXISTS using_default_discounts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_discount_settings jsonb,
ADD COLUMN IF NOT EXISTS discounts_disabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS using_default_payment boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_deposit_type text,
ADD COLUMN IF NOT EXISTS custom_deposit_amount numeric,
ADD COLUMN IF NOT EXISTS custom_final_payment_days integer;

-- Add comments for tour overrides
COMMENT ON COLUMN tours.using_default_cancellation IS 'If true, inherit from guide profile cancellation settings';
COMMENT ON COLUMN tours.custom_cancellation_approach IS 'Tour-specific override for cancellation approach';
COMMENT ON COLUMN tours.custom_cancellation_policy_type IS 'Tour-specific override for policy type';
COMMENT ON COLUMN tours.using_default_discounts IS 'If true, inherit from guide profile discount settings';
COMMENT ON COLUMN tours.custom_discount_settings IS 'Tour-specific discount overrides (same structure as guide defaults)';
COMMENT ON COLUMN tours.discounts_disabled IS 'If true, disable all discounts for this tour';
COMMENT ON COLUMN tours.using_default_payment IS 'If true, inherit from guide profile payment settings';
COMMENT ON COLUMN tours.custom_deposit_type IS 'Tour-specific override for deposit type';
COMMENT ON COLUMN tours.custom_deposit_amount IS 'Tour-specific override for deposit amount';
COMMENT ON COLUMN tours.custom_final_payment_days IS 'Tour-specific override for final payment timing';

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_tours_policy_overrides ON tours(guide_id, using_default_cancellation, using_default_discounts, using_default_payment);