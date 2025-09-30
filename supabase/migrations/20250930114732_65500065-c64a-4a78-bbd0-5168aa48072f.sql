-- Remove duplicate entries, keeping only the oldest one
DELETE FROM public.tour_step_templates a
USING public.tour_step_templates b
WHERE a.id > b.id
  AND a.step_name = b.step_name
  AND a.category = b.category
  AND a.item_text = b.item_text;

-- Add unique constraint to prevent duplicates in the future
ALTER TABLE public.tour_step_templates
ADD CONSTRAINT tour_step_templates_unique_item 
UNIQUE (step_name, category, item_text);
