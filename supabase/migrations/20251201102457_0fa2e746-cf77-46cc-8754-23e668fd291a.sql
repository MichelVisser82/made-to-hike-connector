-- Create a trigger to automatically process tour completion transfers
-- This calls the process-tour-completion edge function when a booking is marked as completed

CREATE OR REPLACE FUNCTION trigger_process_tour_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger for escrow-enabled bookings that are newly completed
  IF NEW.status = 'completed' 
     AND NEW.escrow_enabled = true 
     AND NEW.transfer_status = 'pending'
     AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Queue the transfer processing (we use pg_notify for async processing)
    -- The actual edge function will be called by a separate worker
    PERFORM pg_notify(
      'tour_completion_transfer',
      json_build_object(
        'booking_id', NEW.id,
        'booking_reference', NEW.booking_reference,
        'tour_id', NEW.tour_id
      )::text
    );
    
    RAISE NOTICE 'Tour completion transfer queued for booking: %', NEW.booking_reference;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_tour_completion_trigger_transfer ON bookings;
CREATE TRIGGER on_tour_completion_trigger_transfer
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_tour_completion();

COMMENT ON FUNCTION trigger_process_tour_completion() IS 'Automatically queues transfer to guide when escrow booking is marked as completed';
COMMENT ON TRIGGER on_tour_completion_trigger_transfer ON bookings IS 'Triggers guide payout processing when tour is completed';