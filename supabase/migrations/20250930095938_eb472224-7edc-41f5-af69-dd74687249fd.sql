-- Add short_description field to tours table
ALTER TABLE public.tours 
ADD COLUMN short_description VARCHAR(140);

-- Set a default short_description for existing tours (truncate description to 140 chars)
UPDATE public.tours 
SET short_description = LEFT(description, 140) 
WHERE short_description IS NULL;