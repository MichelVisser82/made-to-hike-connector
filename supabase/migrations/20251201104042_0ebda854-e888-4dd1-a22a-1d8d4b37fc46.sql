-- Enable the trigger that was disabled
ALTER TABLE bookings ENABLE TRIGGER on_tour_completion_trigger_transfer;

-- Update the trigger function to use pg_net instead of pg_notify
CREATE OR REPLACE FUNCTION trigger_process_tour_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if escrow is enabled and status changed to 'completed'
  IF NEW.escrow_enabled = true AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Use pg_net to invoke the edge function
    PERFORM net.http_post(
      url := 'https://ohecxwxumzpfcfsokfkg.supabase.co/functions/v1/process-tour-completion',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'booking_id', NEW.id::text
      ),
      timeout_milliseconds := 30000
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's properly attached
DROP TRIGGER IF EXISTS on_tour_completion_trigger_transfer ON bookings;
CREATE TRIGGER on_tour_completion_trigger_transfer
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_tour_completion();