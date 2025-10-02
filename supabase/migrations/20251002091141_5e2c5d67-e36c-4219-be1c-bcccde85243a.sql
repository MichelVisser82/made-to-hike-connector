-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create trigger function that automatically sends Slack notifications
-- when verification status changes to 'pending'
CREATE OR REPLACE FUNCTION public.notify_slack_on_verification_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  -- Only trigger when status changes TO 'pending'
  IF NEW.verification_status = 'pending' AND 
     (TG_OP = 'INSERT' OR OLD.verification_status IS DISTINCT FROM 'pending') THEN
    
    -- Get Supabase URL and service key
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_key := current_setting('app.settings.service_role_key', true);
    
    -- If settings not configured, use environment defaults
    IF supabase_url IS NULL THEN
      supabase_url := 'https://ohecxwxumzpfcfsokfkg.supabase.co';
    END IF;
    
    IF service_key IS NULL THEN
      service_key := current_setting('supabase.service_role_key', true);
    END IF;
    
    -- Make async HTTP request to edge function via pg_net
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/slack-verification-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'verificationId', NEW.id::text,
        'action', 'send'
      ),
      timeout_milliseconds := 30000
    );
    
    -- Log for debugging
    RAISE LOG 'Slack notification triggered for verification ID: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_verification_pending ON public.user_verifications;

-- Attach trigger to user_verifications table
CREATE TRIGGER on_verification_pending
  AFTER INSERT OR UPDATE ON public.user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_slack_on_verification_pending();

-- Add helpful comment
COMMENT ON FUNCTION public.notify_slack_on_verification_pending() IS 
  'Automatically sends Slack notification when verification status changes to pending. Uses pg_net for async HTTP requests.';