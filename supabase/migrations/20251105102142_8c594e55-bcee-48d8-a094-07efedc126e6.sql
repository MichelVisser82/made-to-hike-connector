-- Add policy_overrides column to tours table to store tour-specific cancellation and discount settings
ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS policy_overrides JSONB DEFAULT '{
  "using_default_cancellation": true,
  "using_default_discounts": true,
  "discounts_disabled": false,
  "using_default_payment": true
}'::jsonb;

-- Add index for faster queries on policy_overrides
CREATE INDEX IF NOT EXISTS idx_tours_policy_overrides ON public.tours USING GIN (policy_overrides);