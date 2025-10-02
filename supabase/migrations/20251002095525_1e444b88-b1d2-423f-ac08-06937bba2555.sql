-- Phase 1: Remove insecure database trigger approach
-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_verification_pending ON public.user_verifications;

-- Drop function if exists
DROP FUNCTION IF EXISTS public.notify_slack_on_verification_pending();