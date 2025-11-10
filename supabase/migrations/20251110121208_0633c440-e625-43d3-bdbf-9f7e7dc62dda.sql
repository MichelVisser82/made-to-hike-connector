-- Add split payment columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_type TEXT CHECK (payment_type IN ('full', 'deposit')) DEFAULT 'full',
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS final_payment_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS final_payment_due_date DATE,
ADD COLUMN IF NOT EXISTS final_payment_status TEXT CHECK (final_payment_status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS final_payment_intent_id TEXT;

-- Add index for querying bookings needing final payment
CREATE INDEX IF NOT EXISTS idx_bookings_final_payment 
ON public.bookings(final_payment_due_date, final_payment_status)
WHERE payment_type = 'deposit' AND final_payment_status = 'pending';

COMMENT ON COLUMN public.bookings.payment_type IS 'Whether this booking uses full payment or deposit+final payment';
COMMENT ON COLUMN public.bookings.deposit_amount IS 'Amount paid as deposit (if payment_type is deposit)';
COMMENT ON COLUMN public.bookings.final_payment_amount IS 'Remaining amount to be paid before tour (if payment_type is deposit)';
COMMENT ON COLUMN public.bookings.final_payment_due_date IS 'Date by which final payment must be completed';
COMMENT ON COLUMN public.bookings.final_payment_status IS 'Status of the final payment';
COMMENT ON COLUMN public.bookings.final_payment_intent_id IS 'Stripe payment intent ID for final payment';