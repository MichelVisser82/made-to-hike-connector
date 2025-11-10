-- Add hiker_email to bookings table for email consistency
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS hiker_email TEXT;

COMMENT ON COLUMN public.bookings.hiker_email IS 'Email address of the hiker at time of booking';

-- Backfill existing bookings with hiker emails
UPDATE public.bookings b
SET hiker_email = p.email
FROM public.profiles p
WHERE b.hiker_id = p.id AND b.hiker_email IS NULL;