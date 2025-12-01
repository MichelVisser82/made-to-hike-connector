-- Add platform revenue tracking columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN guide_fee_amount numeric,
ADD COLUMN platform_revenue numeric;

COMMENT ON COLUMN public.bookings.guide_fee_amount IS 'Fee deducted from guide earnings (X% of post-discounted price)';
COMMENT ON COLUMN public.bookings.platform_revenue IS 'Total platform revenue (guide fee + hiker service fee)';