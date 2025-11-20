-- Fix search_path security warning for archive_completed_custom_tour function
CREATE OR REPLACE FUNCTION archive_completed_custom_tour()
RETURNS TRIGGER AS $$
BEGIN
  -- If booking status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Archive the tour if it's custom and offer is accepted
    UPDATE tours t
    SET archived = true
    WHERE t.id = NEW.tour_id
      AND t.is_custom_tour = true
      AND EXISTS (
        SELECT 1 FROM tour_offers o
        WHERE o.tour_id = t.id
          AND o.booking_id = NEW.id
          AND o.offer_status = 'accepted'
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp;