-- Update get_guide_all_date_slots to include tour duration
DROP FUNCTION IF EXISTS public.get_guide_all_date_slots(uuid, date, date);

CREATE OR REPLACE FUNCTION public.get_guide_all_date_slots(
  p_guide_id uuid, 
  p_start_date date DEFAULT CURRENT_DATE, 
  p_end_date date DEFAULT ((CURRENT_DATE + '90 days'::interval))::date
)
RETURNS TABLE(
  slot_id uuid, 
  tour_id uuid, 
  tour_title text, 
  tour_duration text,
  slot_date date, 
  spots_total integer, 
  spots_booked integer, 
  spots_remaining integer, 
  price numeric, 
  currency currency, 
  discount_percentage integer, 
  availability_status text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ds.id as slot_id,
    t.id as tour_id,
    t.title as tour_title,
    t.duration as tour_duration,
    ds.slot_date,
    ds.spots_total,
    ds.spots_booked,
    (ds.spots_total - ds.spots_booked) as spots_remaining,
    COALESCE(ds.price_override, t.price) as price,
    COALESCE(ds.currency_override, t.currency) as currency,
    ds.discount_percentage,
    CASE 
      WHEN ds.spots_booked >= ds.spots_total THEN 'booked'
      WHEN ds.spots_booked > 0 THEN 'limited'
      ELSE 'available'
    END as availability_status
  FROM public.tour_date_slots ds
  JOIN public.tours t ON t.id = ds.tour_id
  WHERE t.guide_id = p_guide_id
    AND ds.is_available = true
    AND ds.slot_date BETWEEN p_start_date AND p_end_date
  ORDER BY ds.slot_date ASC;
END;
$function$;