-- Migration 2: Create review_responses and review_notifications tables

-- Table for review responses (one-time comments)
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL,
  responder_type TEXT NOT NULL CHECK (responder_type IN ('guide', 'hiker')),
  response_text TEXT NOT NULL CHECK (char_length(response_text) <= 300),
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'hidden')),
  moderation_flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  UNIQUE(review_id)
);

-- Table for review notifications tracking
CREATE TABLE IF NOT EXISTS review_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('guide', 'hiker')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('review_available', 'first_reminder', 'second_reminder', 'final_reminder', 'review_published', 'response_received')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_responder ON review_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_review_notifications_booking_id ON review_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_review_notifications_recipient ON review_notifications(recipient_id, notification_type);
CREATE INDEX IF NOT EXISTS idx_review_notifications_type_sent ON review_notifications(notification_type, sent_at);

-- Enable RLS
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_notifications ENABLE ROW LEVEL SECURITY;