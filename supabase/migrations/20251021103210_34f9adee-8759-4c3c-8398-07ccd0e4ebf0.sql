-- Fix search_path for generate_booking_reference function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;