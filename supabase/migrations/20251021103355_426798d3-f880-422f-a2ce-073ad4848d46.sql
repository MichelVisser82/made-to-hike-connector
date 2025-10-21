-- Migration 4: Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('platform', 'guide')),
  created_by UUID REFERENCES profiles(id),
  guide_id UUID REFERENCES profiles(id), -- Only for guide-owned codes
  applicable_tour_ids UUID[], -- Tours this code can be used for (guide-owned only)
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  min_purchase_amount NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_guide_id ON discount_codes(guide_id);

-- RLS Policies
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active discount codes" ON discount_codes;
CREATE POLICY "Anyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

DROP POLICY IF EXISTS "Admins can manage all discount codes" ON discount_codes;
CREATE POLICY "Admins can manage all discount codes"
  ON discount_codes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  ));

DROP POLICY IF EXISTS "Guides can manage their own discount codes" ON discount_codes;
CREATE POLICY "Guides can manage their own discount codes"
  ON discount_codes FOR ALL
  USING (guide_id = auth.uid());