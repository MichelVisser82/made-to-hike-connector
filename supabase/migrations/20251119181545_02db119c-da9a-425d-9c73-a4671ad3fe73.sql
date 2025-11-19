-- Enable RLS on tour_offers if not already enabled
ALTER TABLE tour_offers ENABLE ROW LEVEL SECURITY;

-- Allow hikers to view their own tour offers
CREATE POLICY "Hikers can view their own tour offers"
ON tour_offers
FOR SELECT
USING (
  hiker_id = auth.uid()
  OR
  booking_id IN (
    SELECT id
    FROM bookings
    WHERE hiker_id = auth.uid()
  )
);