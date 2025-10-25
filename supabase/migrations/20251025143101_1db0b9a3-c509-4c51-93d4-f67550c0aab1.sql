-- Drop the old policy that only checks conversation participants
DROP POLICY IF EXISTS "Users can view profiles of conversation participants" ON profiles;

-- Create new policy that allows viewing profiles of:
-- 1. People in conversations you're part of (hiker_id/guide_id)
-- 2. People who have sent messages in conversations you're part of
CREATE POLICY "Users can view profiles of conversation participants and message senders"
ON profiles FOR SELECT
USING (
  -- Allow viewing own profile
  auth.uid() = id
  OR
  -- Allow viewing profiles of people in conversations you're in
  EXISTS (
    SELECT 1
    FROM conversations c
    WHERE (
      (c.hiker_id = auth.uid() OR c.guide_id = auth.uid())
      AND (c.hiker_id = profiles.id OR c.guide_id = profiles.id)
    )
  )
  OR
  -- Allow viewing profiles of people who have sent messages in your conversations
  EXISTS (
    SELECT 1
    FROM conversations c
    INNER JOIN messages m ON m.conversation_id = c.id
    WHERE (c.hiker_id = auth.uid() OR c.guide_id = auth.uid())
      AND m.sender_id = profiles.id
  )
);