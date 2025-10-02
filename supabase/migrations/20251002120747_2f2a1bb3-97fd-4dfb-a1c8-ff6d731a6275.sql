-- Add performance indexes for guide profiles and verifications
-- These indexes significantly improve query performance at scale

-- Index for looking up guide profiles by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_guide_profiles_user_id ON public.guide_profiles(user_id);

-- Index for looking up user verifications by user_id
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON public.user_verifications(user_id);

-- Index for filtering verifications by status (admin dashboard queries)
CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON public.user_verifications(verification_status);

-- Index for looking up tours by guide_id (guide dashboard queries)
CREATE INDEX IF NOT EXISTS idx_tours_guide_id ON public.tours(guide_id);

-- Index for active tours filtering (public search queries)
CREATE INDEX IF NOT EXISTS idx_tours_is_active ON public.tours(is_active) WHERE is_active = true;

-- Composite index for guide verification lookups (combines common filters)
CREATE INDEX IF NOT EXISTS idx_guide_profiles_verified_user ON public.guide_profiles(verified, user_id);

-- Create RPC function for atomic guide verification updates
-- This ensures guide profile and certifications are updated together or not at all
CREATE OR REPLACE FUNCTION public.verify_guide_certification(
  p_user_id UUID,
  p_cert_updates JSONB,
  p_verified_by TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_current_certs JSONB;
  v_updated_certs JSONB;
BEGIN
  -- Get current certifications
  SELECT certifications INTO v_current_certs
  FROM guide_profiles
  WHERE user_id = p_user_id;

  IF v_current_certs IS NULL THEN
    RAISE EXCEPTION 'Guide profile not found for user_id: %', p_user_id;
  END IF;

  -- Merge the certification updates
  v_updated_certs := jsonb_set(
    v_current_certs,
    ARRAY[p_cert_updates->>'index'],
    (v_current_certs->>(p_cert_updates->>'index')::int)::jsonb || p_cert_updates->'updates'
  );

  -- Update guide profile with new certifications in a single transaction
  UPDATE guide_profiles
  SET 
    certifications = v_updated_certs,
    verified = true,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update verification status
  UPDATE user_verifications
  SET 
    verification_status = 'approved'::verification_status,
    admin_notes = COALESCE(admin_notes, '') || E'\nCertification verified by ' || p_verified_by || ' on ' || NOW()::TEXT,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Return success result
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'verified_by', p_verified_by,
    'updated_at', NOW()
  );

  RETURN v_result;
END;
$$;