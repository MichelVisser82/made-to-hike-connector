-- Add metadata column first
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Check current conversation_type values and update any invalid ones to 'tour_inquiry'
UPDATE conversations 
SET conversation_type = 'tour_inquiry' 
WHERE conversation_type NOT IN ('tour_inquiry', 'booking_chat', 'admin_support', 'guide_admin');

-- Now we can safely update the constraint
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_conversation_type_check;

ALTER TABLE conversations ADD CONSTRAINT conversations_conversation_type_check 
CHECK (conversation_type IN ('tour_inquiry', 'booking_chat', 'admin_support', 'guide_admin', 'custom_tour_request'));