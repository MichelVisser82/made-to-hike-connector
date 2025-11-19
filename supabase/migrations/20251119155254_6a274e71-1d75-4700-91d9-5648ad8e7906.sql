-- Revert tour_id to NOT NULL since custom offers now create tours
-- First update any existing NULL tour_id bookings (should not exist after this change)
UPDATE public.bookings
SET tour_id = (
  SELECT tour_id FROM public.tour_offers 
  WHERE tour_offers.booking_id = bookings.id 
  LIMIT 1
)
WHERE tour_id IS NULL AND EXISTS (
  SELECT 1 FROM public.tour_offers 
  WHERE tour_offers.booking_id = bookings.id
);

-- Now make tour_id NOT NULL again
ALTER TABLE public.bookings
ALTER COLUMN tour_id SET NOT NULL;