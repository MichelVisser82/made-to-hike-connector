-- Add UPDATE policy for message_read_receipts to allow upsert operations
CREATE POLICY "Users can update their own read receipts"
ON public.message_read_receipts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);