-- Create function to auto-archive completed custom tours
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
$$ LANGUAGE plpgsql;

-- Create trigger on bookings table
DROP TRIGGER IF EXISTS archive_completed_custom_tour_trigger ON bookings;
CREATE TRIGGER archive_completed_custom_tour_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION archive_completed_custom_tour();