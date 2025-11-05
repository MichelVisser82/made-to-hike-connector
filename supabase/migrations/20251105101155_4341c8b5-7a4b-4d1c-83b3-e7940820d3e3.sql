-- Change tours.region column from enum to TEXT to support custom regions
ALTER TABLE public.tours
ALTER COLUMN region TYPE TEXT;