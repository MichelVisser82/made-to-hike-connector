-- Add unique constraint for webhook idempotency
ALTER TABLE stripe_webhook_events 
ADD CONSTRAINT stripe_webhook_events_event_id_unique 
UNIQUE (stripe_event_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed 
ON stripe_webhook_events(stripe_event_id, processed);