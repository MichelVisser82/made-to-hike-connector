-- First, drop the problematic policy
DROP POLICY IF EXISTS "Hikers can view tours for own bookings" ON public.tours;

-- Create a security definer function to check if a hiker has a booking for a tour
CREATE OR REPLACE FUNCTION public.hiker_has_booking_for_tour(_tour_id uuid, _hiker_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE tour_id = _tour_id
      AND hiker_id = _hiker_id
  )
$$;

-- Create the policy using the security definer function
CREATE POLICY "Hikers can view tours for own bookings"
ON public.tours
FOR SELECT
USING (
  public.hiker_has_booking_for_tour(tours.id, auth.uid())
);