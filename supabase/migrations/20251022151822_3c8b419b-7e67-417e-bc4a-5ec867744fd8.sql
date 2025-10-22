-- Add unique constraint to prevent duplicate read receipts
ALTER TABLE message_read_receipts 
ADD CONSTRAINT message_read_receipts_message_user_unique 
UNIQUE (message_id, user_id);