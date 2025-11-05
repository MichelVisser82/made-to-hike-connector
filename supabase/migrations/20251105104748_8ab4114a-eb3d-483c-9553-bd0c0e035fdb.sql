-- Clean up existing date slots with price_override = 0
-- These should be NULL to fall back to the tour's base price
UPDATE tour_date_slots 
SET price_override = NULL 
WHERE price_override = 0;