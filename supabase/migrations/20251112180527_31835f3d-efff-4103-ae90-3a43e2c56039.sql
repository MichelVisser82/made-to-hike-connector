-- First, cancel the duplicate booking (the one without payment)
UPDATE bookings 
SET status = 'cancelled' 
WHERE id = '3256ccca-a844-4446-bf73-b5480e7d40fd';

-- Add unique constraint to prevent duplicate active bookings
-- This prevents race conditions where duplicate checks happen simultaneously
CREATE UNIQUE INDEX bookings_unique_active_booking 
ON bookings (hiker_id, tour_id, booking_date) 
WHERE status IN ('pending', 'pending_confirmation', 'confirmed');