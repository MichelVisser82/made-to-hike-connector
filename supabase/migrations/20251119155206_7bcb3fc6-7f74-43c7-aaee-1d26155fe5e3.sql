-- Add tour_id to tour_offers table to link custom offers to tours
ALTER TABLE public.tour_offers
ADD COLUMN tour_id uuid REFERENCES public.tours(id) ON DELETE SET NULL;