-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup-abandoned-bookings to run every 10 minutes
SELECT cron.schedule(
  'cleanup-abandoned-bookings',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://ohecxwxumzpfcfsokfkg.supabase.co/functions/v1/cleanup-abandoned-bookings',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZWN4d3h1bXpwZmNmc29rZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTE4NjMsImV4cCI6MjA3MzU4Nzg2M30.yh8OplVdcPI4YowgkmHBDHqqGrGJalrM1Z4NbXt_HNM"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);