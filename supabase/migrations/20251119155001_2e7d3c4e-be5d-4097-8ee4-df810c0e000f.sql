-- Allow custom-offer bookings without a linked standard tour
ALTER TABLE public.bookings
ALTER COLUMN tour_id DROP NOT NULL;