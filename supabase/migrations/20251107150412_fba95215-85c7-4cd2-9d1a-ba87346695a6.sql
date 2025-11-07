-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the collect-final-payments function to run daily at 6 AM UTC
SELECT cron.schedule(
  'collect-final-payments-daily',
  '0 6 * * *', -- Every day at 6 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://ohecxwxumzpfcfsokfkg.supabase.co/functions/v1/collect-final-payments',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZWN4d3h1bXpwZmNmc29rZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTE4NjMsImV4cCI6MjA3MzU4Nzg2M30.yh8OplVdcPI4YowgkmHBDHqqGrGJalrM1Z4NbXt_HNM"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);