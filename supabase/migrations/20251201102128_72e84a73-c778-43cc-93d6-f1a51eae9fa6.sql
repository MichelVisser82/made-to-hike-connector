-- Phase 1: Add transfer tracking and escrow migration marker to bookings table
ALTER TABLE bookings 
ADD COLUMN stripe_transfer_id TEXT,
ADD COLUMN transfer_status TEXT DEFAULT 'pending',
ADD COLUMN transfer_created_at TIMESTAMPTZ,
ADD COLUMN transfer_amount NUMERIC,
ADD COLUMN escrow_enabled BOOLEAN DEFAULT false;

-- Add index for efficient transfer lookups
CREATE INDEX idx_bookings_stripe_transfer_id ON bookings(stripe_transfer_id) WHERE stripe_transfer_id IS NOT NULL;
CREATE INDEX idx_bookings_transfer_status ON bookings(transfer_status) WHERE transfer_status != 'pending';
CREATE INDEX idx_bookings_escrow_enabled ON bookings(escrow_enabled) WHERE escrow_enabled = true;

-- Comment to explain the new fields
COMMENT ON COLUMN bookings.stripe_transfer_id IS 'Stripe transfer ID for guide payment after tour completion';
COMMENT ON COLUMN bookings.transfer_status IS 'Status of guide transfer: pending, succeeded, failed';
COMMENT ON COLUMN bookings.transfer_created_at IS 'Timestamp when transfer to guide was created';
COMMENT ON COLUMN bookings.transfer_amount IS 'Amount transferred to guide (after platform fees)';
COMMENT ON COLUMN bookings.escrow_enabled IS 'Indicates if this booking uses escrow model (true) or legacy immediate transfer (false)';