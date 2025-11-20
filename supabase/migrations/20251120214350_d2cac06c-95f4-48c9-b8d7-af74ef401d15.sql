-- Add waiver_data column to bookings table to store complete waiver information
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS waiver_data JSONB;

COMMENT ON COLUMN bookings.waiver_data IS 'Complete waiver form data including all sections, signatures, and timestamps for legal records and future reference';