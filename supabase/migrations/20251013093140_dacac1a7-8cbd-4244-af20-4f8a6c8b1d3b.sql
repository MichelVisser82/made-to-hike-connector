-- =====================================================
-- MADETOHIKE CHAT SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================

-- 1. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  hiker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guide_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_type VARCHAR(50) NOT NULL DEFAULT 'tour_inquiry',
  status VARCHAR(20) DEFAULT 'active',
  anonymous_email VARCHAR(255),
  anonymous_name VARCHAR(100),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_type VARCHAR(20) NOT NULL,
  sender_name VARCHAR(100),
  message_type VARCHAR(20) DEFAULT 'text',
  content TEXT NOT NULL,
  moderated_content TEXT,
  attachment_url TEXT,
  attachment_type VARCHAR(50),
  moderation_status VARCHAR(20) DEFAULT 'approved',
  moderation_flags JSONB DEFAULT '[]'::jsonb,
  is_automated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- 3. MESSAGE READ RECEIPTS
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- 4. AUTOMATED MESSAGES
CREATE TABLE IF NOT EXISTS automated_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  message_template TEXT NOT NULL,
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TICKETS SYSTEM
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID UNIQUE REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category VARCHAR(50),
  slack_thread_ts VARCHAR(50),
  slack_channel_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TICKET ACTIVITIES (AUDIT LOG)
CREATE TABLE IF NOT EXISTS ticket_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name VARCHAR(100),
  action VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHAT ATTACHMENTS
CREATE TABLE IF NOT EXISTS chat_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  thumbnail_path TEXT,
  moderation_status VARCHAR(20) DEFAULT 'pending',
  detected_violations JSONB DEFAULT '[]'::jsonb,
  blurred_regions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email_on_new_message BOOLEAN DEFAULT true,
  email_on_ticket_update BOOLEAN DEFAULT true,
  email_digest_frequency VARCHAR(20) DEFAULT 'instant',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER PRESENCE
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversations_tour ON conversations(tour_id);
CREATE INDEX IF NOT EXISTS idx_conversations_hiker ON conversations(hiker_id);
CREATE INDEX IF NOT EXISTS idx_conversations_guide ON conversations(guide_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_moderation ON messages(moderation_status) WHERE moderation_status != 'approved';

CREATE INDEX IF NOT EXISTS idx_message_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_user ON message_read_receipts(user_id);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority, status);

CREATE INDEX IF NOT EXISTS idx_ticket_activities_ticket ON ticket_activities(ticket_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attachments_message ON chat_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_conversation ON chat_attachments(conversation_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Auto-generate ticket numbers (TICK-YYYY-####)
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  year_part VARCHAR(4);
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO next_num
  FROM tickets
  WHERE ticket_number LIKE 'TICK-' || year_part || '-%';
  
  NEW.ticket_number := 'TICK-' || year_part || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- Update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- CONVERSATIONS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = hiker_id OR 
    auth.uid() = guide_id OR 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = hiker_id OR 
    (auth.uid() = guide_id AND has_role(auth.uid(), 'guide')) OR
    anonymous_email IS NOT NULL
  );

CREATE POLICY "Participants can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = hiker_id OR auth.uid() = guide_id OR has_role(auth.uid(), 'admin'));

-- MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.hiker_id = auth.uid() OR c.guide_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.hiker_id = auth.uid() OR c.guide_id = auth.uid())
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id OR has_role(auth.uid(), 'admin'));

-- MESSAGE READ RECEIPTS
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view read receipts for their messages"
  ON message_read_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.id = message_read_receipts.message_id
      AND (c.hiker_id = auth.uid() OR c.guide_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can create read receipts"
  ON message_read_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AUTOMATED MESSAGES
ALTER TABLE automated_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides can manage their automated messages"
  ON automated_messages FOR ALL
  USING (auth.uid() = guide_id OR has_role(auth.uid(), 'admin'));

-- TICKETS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all tickets"
  ON tickets FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view tickets for their conversations"
  ON tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = tickets.conversation_id
      AND (c.hiker_id = auth.uid() OR c.guide_id = auth.uid())
    )
  );

-- TICKET ACTIVITIES
ALTER TABLE ticket_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ticket activities"
  ON ticket_activities FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- CHAT ATTACHMENTS
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in their conversations"
  ON chat_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = chat_attachments.conversation_id
      AND (c.hiker_id = auth.uid() OR c.guide_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can upload attachments to their conversations"
  ON chat_attachments FOR INSERT
  WITH CHECK (auth.uid() = uploader_id);

-- NOTIFICATION PREFERENCES
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- USER PRESENCE
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view presence of conversation participants"
  ON user_presence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE (c.hiker_id = auth.uid() OR c.guide_id = auth.uid())
      AND (c.hiker_id = user_presence.user_id OR c.guide_id = user_presence.user_id)
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update their own presence"
  ON user_presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence status"
  ON user_presence FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- ENABLE REALTIME FOR TABLES
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;

-- =====================================================
-- CREATE STORAGE BUCKET FOR CHAT ATTACHMENTS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat attachments
CREATE POLICY "Users can upload to their conversations"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view attachments in their conversations"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );