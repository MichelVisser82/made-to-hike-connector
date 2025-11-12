-- Fix final_payment_due_date for existing deposit bookings
-- Calculate as tour_date (booking_date) - final_payment_days from guide's policy

UPDATE bookings b
SET 
  final_payment_due_date = (b.booking_date - (gp.final_payment_days || ' days')::interval)::date,
  final_payment_status = COALESCE(b.final_payment_status, 'pending'),
  updated_at = NOW()
FROM tours t
JOIN guide_profiles gp ON t.guide_id = gp.user_id
WHERE b.tour_id = t.id
  AND b.payment_type = 'deposit'
  AND b.final_payment_due_date IS NOT NULL;