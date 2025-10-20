-- Create tour_date_slots table
CREATE TABLE IF NOT EXISTS public.tour_date_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  spots_total integer NOT NULL DEFAULT 1 CHECK (spots_total > 0),
  spots_booked integer NOT NULL DEFAULT 0 CHECK (spots_booked >= 0 AND spots_booked <= spots_total),
  price_override numeric,
  currency_override currency,
  discount_percentage integer CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_label text,
  early_bird_date date,
  notes text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tour_id, slot_date)
);

-- Enable RLS
ALTER TABLE public.tour_date_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_date_slots
CREATE POLICY "Anyone can view available date slots"
  ON public.tour_date_slots
  FOR SELECT
  USING (is_available = true);

CREATE POLICY "Guides can manage their tour date slots"
  ON public.tour_date_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tours
      WHERE tours.id = tour_date_slots.tour_id
        AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all date slots"
  ON public.tour_date_slots
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::text));

-- Create indexes for performance
CREATE INDEX idx_tour_date_slots_tour_id ON public.tour_date_slots(tour_id);
CREATE INDEX idx_tour_date_slots_date ON public.tour_date_slots(slot_date);
CREATE INDEX idx_tour_date_slots_available ON public.tour_date_slots(is_available) WHERE is_available = true;

-- Function to get tour date availability
CREATE OR REPLACE FUNCTION public.get_tour_date_availability(p_tour_id uuid)
RETURNS TABLE (
  slot_id uuid,
  slot_date date,
  spots_total integer,
  spots_booked integer,
  spots_remaining integer,
  price numeric,
  currency currency,
  discount_percentage integer,
  discount_label text,
  is_early_bird boolean,
  is_available boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.id as slot_id,
    ds.slot_date,
    ds.spots_total,
    ds.spots_booked,
    (ds.spots_total - ds.spots_booked) as spots_remaining,
    COALESCE(ds.price_override, t.price) as price,
    COALESCE(ds.currency_override, t.currency) as currency,
    ds.discount_percentage,
    ds.discount_label,
    (ds.early_bird_date IS NOT NULL AND CURRENT_DATE <= ds.early_bird_date) as is_early_bird,
    ds.is_available
  FROM public.tour_date_slots ds
  JOIN public.tours t ON t.id = ds.tour_id
  WHERE ds.tour_id = p_tour_id
    AND ds.is_available = true
    AND ds.slot_date >= CURRENT_DATE
  ORDER BY ds.slot_date ASC;
END;
$$;

-- Function to get guide's all date slots for calendar view
CREATE OR REPLACE FUNCTION public.get_guide_all_date_slots(
  p_guide_id uuid,
  p_start_date date DEFAULT CURRENT_DATE,
  p_end_date date DEFAULT (CURRENT_DATE + interval '90 days')::date
)
RETURNS TABLE (
  slot_id uuid,
  tour_id uuid,
  tour_title text,
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
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.id as slot_id,
    t.id as tour_id,
    t.title as tour_title,
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
$$;

-- Trigger to update spots_booked when bookings are created
CREATE OR REPLACE FUNCTION public.update_date_slot_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment spots_booked when new booking is created
  IF TG_OP = 'INSERT' AND NEW.date_slot_id IS NOT NULL THEN
    UPDATE public.tour_date_slots
    SET spots_booked = spots_booked + NEW.participants,
        updated_at = now()
    WHERE id = NEW.date_slot_id;
  END IF;

  -- Handle booking status changes
  IF TG_OP = 'UPDATE' AND OLD.date_slot_id IS NOT NULL THEN
    -- If booking is cancelled, decrease spots_booked
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      UPDATE public.tour_date_slots
      SET spots_booked = GREATEST(0, spots_booked - OLD.participants),
          updated_at = now()
      WHERE id = OLD.date_slot_id;
    -- If booking is uncancelled, increase spots_booked
    ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
      UPDATE public.tour_date_slots
      SET spots_booked = spots_booked + NEW.participants,
          updated_at = now()
      WHERE id = NEW.date_slot_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Add date_slot_id column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS date_slot_id uuid REFERENCES public.tour_date_slots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_date_slot_id ON public.bookings(date_slot_id);

-- Create trigger on bookings
DROP TRIGGER IF EXISTS trigger_update_date_slot_on_booking ON public.bookings;
CREATE TRIGGER trigger_update_date_slot_on_booking
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_date_slot_on_booking();

-- Add updated_at trigger to tour_date_slots
CREATE TRIGGER update_tour_date_slots_updated_at
  BEFORE UPDATE ON public.tour_date_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migration function: Convert existing tours' available_dates to date_slots
CREATE OR REPLACE FUNCTION public.migrate_tour_dates_to_slots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tour_record RECORD;
  date_val date;
BEGIN
  FOR tour_record IN 
    SELECT id, available_dates, price, currency, group_size
    FROM public.tours
    WHERE array_length(available_dates, 1) > 0
  LOOP
    -- Create a date slot for each available date
    FOREACH date_val IN ARRAY tour_record.available_dates
    LOOP
      INSERT INTO public.tour_date_slots (
        tour_id,
        slot_date,
        spots_total,
        spots_booked,
        is_available
      )
      VALUES (
        tour_record.id,
        date_val,
        tour_record.group_size,
        0,
        true
      )
      ON CONFLICT (tour_id, slot_date) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- Run migration for existing tours
SELECT public.migrate_tour_dates_to_slots();