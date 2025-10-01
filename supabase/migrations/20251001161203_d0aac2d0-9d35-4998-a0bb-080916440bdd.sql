-- Update the ML certification to mark it as verified
-- This is a one-time fix for the certification that was previously approved but lost its verification status

UPDATE guide_profiles
SET certifications = jsonb_set(
  certifications,
  '{0}',
  certifications->0 || jsonb_build_object(
    'verifiedDate', to_jsonb(NOW()),
    'verifiedBy', to_jsonb('admin'::text)
  )
)
WHERE user_id = 'fff8cf91-e3e2-4dbd-b54f-bb3fa822542b'
  AND certifications->0->>'title' = 'ML (Mountain Leader, UK)'
  AND certifications->0->>'verifiedDate' IS NULL;