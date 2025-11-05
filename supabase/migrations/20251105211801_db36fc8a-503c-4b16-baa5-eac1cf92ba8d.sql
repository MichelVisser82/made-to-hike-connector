
-- Fix Great Alps tour to use default payment settings (30% deposit)
UPDATE tours
SET policy_overrides = jsonb_set(
  COALESCE(policy_overrides, '{}'::jsonb),
  '{using_default_payment}',
  'true'::jsonb
)
WHERE slug = 'great-alps-dolomites'
  AND policy_overrides->>'using_default_payment' = 'false';
