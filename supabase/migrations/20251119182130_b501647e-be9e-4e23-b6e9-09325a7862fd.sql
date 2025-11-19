-- Enable RLS on tours table if not already enabled
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- Allow hikers to view tours for their own bookings
CREATE POLICY "Hikers can view tours for own bookings"
ON public.tours
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE
      b.tour_id = tours.id
      AND b.hiker_id = auth.uid()
  )
);