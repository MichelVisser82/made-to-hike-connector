-- Allow users to view profiles of people they have conversations with
CREATE POLICY "Users can view profiles of conversation participants"
ON profiles
FOR SELECT
USING (
  -- User can see profiles of people they're chatting with
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE (c.hiker_id = auth.uid() OR c.guide_id = auth.uid())
      AND (c.hiker_id = profiles.id OR c.guide_id = profiles.id)
  )
);