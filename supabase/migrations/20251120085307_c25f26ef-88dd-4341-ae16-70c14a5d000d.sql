
-- Backfill missing tour_date_slots for accepted custom tour offers
-- This creates calendar entries for custom tours that were accepted but missing date slots

INSERT INTO tour_date_slots (
  tour_id,
  slot_date,
  spots_total,
  spots_booked,
  is_available,
  price_override,
  currency_override,
  notes
)
SELECT 
  offers.tour_id,
  offers.preferred_date,
  offers.group_size,
  offers.group_size, -- All spots immediately booked for custom tour
  true, -- Make it visible in calendar
  offers.price_per_person,
  offers.currency::currency,
  CONCAT('Custom tour booking from offer ', offers.id)
FROM tour_offers offers
WHERE offers.offer_status = 'accepted'
  AND offers.booking_id IS NOT NULL
  AND NOT EXISTS (
    -- Only insert if date slot doesn't already exist
    SELECT 1 FROM tour_date_slots tds
    WHERE tds.tour_id = offers.tour_id 
    AND tds.slot_date = offers.preferred_date
  );
