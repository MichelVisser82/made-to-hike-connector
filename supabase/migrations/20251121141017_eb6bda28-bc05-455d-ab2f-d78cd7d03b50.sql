-- Create participant_tokens table for secure link management
CREATE TABLE IF NOT EXISTS participant_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  participant_email VARCHAR(255) NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  participant_index INTEGER NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  waiver_completed BOOLEAN DEFAULT FALSE,
  insurance_completed BOOLEAN DEFAULT FALSE,
  emergency_contact_completed BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE NULL,
  reminder_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE NULL,
  
  CONSTRAINT unique_booking_participant UNIQUE(booking_id, participant_index)
);

CREATE INDEX IF NOT EXISTS idx_participant_tokens_hash ON participant_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_participant_tokens_booking ON participant_tokens(booking_id);
CREATE INDEX IF NOT EXISTS idx_participant_tokens_expires ON participant_tokens(expires_at);

-- Create participant_documents table for storing submitted information
CREATE TABLE IF NOT EXISTS participant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_token_id UUID NOT NULL REFERENCES participant_tokens(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  
  -- Waiver data
  waiver_data JSONB,
  waiver_signature_url TEXT,
  waiver_submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Insurance data
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(255),
  insurance_document_url TEXT,
  insurance_emergency_number VARCHAR(50),
  insurance_submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Emergency contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  emergency_contact_submitted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participant_documents_booking ON participant_documents(booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_participant_documents_token ON participant_documents(participant_token_id);

-- Enable RLS on participant_tokens
ALTER TABLE participant_tokens ENABLE ROW LEVEL SECURITY;

-- Bookers can view their booking's participant tokens
CREATE POLICY "Bookers can view their participants"
  ON participant_tokens FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE hiker_id = auth.uid()
    )
  );

-- Guides can view their tour bookings' participant tokens
CREATE POLICY "Guides can view tour participants"
  ON participant_tokens FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN tours t ON t.id = b.tour_id
      WHERE t.guide_id = auth.uid()
    )
  );

-- Admin access
CREATE POLICY "Admins can manage all tokens"
  ON participant_tokens FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Enable RLS on participant_documents
ALTER TABLE participant_documents ENABLE ROW LEVEL SECURITY;

-- Bookers can view their participants' documents
CREATE POLICY "Bookers can view their participants' documents"
  ON participant_documents FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE hiker_id = auth.uid()
    )
  );

-- Guides can view tour participants' documents
CREATE POLICY "Guides can view tour participants' documents"
  ON participant_documents FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN tours t ON t.id = b.tour_id
      WHERE t.guide_id = auth.uid()
    )
  );

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents"
  ON participant_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'));