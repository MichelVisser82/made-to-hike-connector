-- Add refund tracking columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS refund_amount numeric,
ADD COLUMN IF NOT EXISTS refund_status text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refunded_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_refund_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refund_reason text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.bookings.refund_amount IS 'Amount refunded to the customer (may differ from total_price if partial refund)';
COMMENT ON COLUMN public.bookings.refund_status IS 'Status of refund: pending, succeeded, failed';
COMMENT ON COLUMN public.bookings.refunded_at IS 'Timestamp when refund was processed';
COMMENT ON COLUMN public.bookings.stripe_refund_id IS 'Stripe refund ID for reference';
COMMENT ON COLUMN public.bookings.refund_reason IS 'Reason for cancellation/refund';