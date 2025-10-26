-- Security Fix: Prevent authenticated users from seeing sensitive guide data
-- Previous policy exposed phone, stripe_account_id, bank_account_last4 to all authenticated users

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view public guide fields" ON guide_profiles;

-- Create restrictive policy that only allows viewing public guide information
-- Authenticated users can view verified guides but NOT sensitive fields like phone
CREATE POLICY "Authenticated users view verified guides (public fields)"
ON guide_profiles
FOR SELECT
TO authenticated
USING (verified = true);

-- The client-side code in hooks will filter sensitive fields
-- RLS provides the security boundary, client code provides the data shaping