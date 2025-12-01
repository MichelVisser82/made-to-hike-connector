-- Fix search_path security warning for trigger function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;