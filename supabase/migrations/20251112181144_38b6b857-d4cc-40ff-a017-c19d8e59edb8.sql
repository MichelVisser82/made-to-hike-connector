-- Enable realtime for bookings table
ALTER TABLE bookings REPLICA IDENTITY FULL;

-- The bookings table is already in the supabase_realtime publication by default
-- but we'll ensure it's there
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;