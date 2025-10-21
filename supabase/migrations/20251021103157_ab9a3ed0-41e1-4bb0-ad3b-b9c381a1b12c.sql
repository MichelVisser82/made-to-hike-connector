-- Migration 3: Extend bookings table with comprehensive booking fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference TEXT UNIQUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_client_secret TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS participants_details JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS primary_contact_id UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_fee_amount NUMERIC DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal NUMERIC;

-- Add trigger to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  year_part VARCHAR(4);
BEGIN
  year_part := TO_CHAR(NOW(), 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_reference FROM 'MTH-\d+-(\d+)$') AS INTEGER)), 0) + 1
  INTO next_num
  FROM bookings
  WHERE booking_reference LIKE 'MTH-' || year_part || '-%';
  
  NEW.booking_reference := 'MTH-' || year_part || '-' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_booking_reference ON bookings;
CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_reference IS NULL)
  EXECUTE FUNCTION generate_booking_reference();