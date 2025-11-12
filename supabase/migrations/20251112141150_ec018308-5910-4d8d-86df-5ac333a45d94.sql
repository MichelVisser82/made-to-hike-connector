-- Fix search path for security by recreating the function with proper settings
DROP TRIGGER IF EXISTS trip_checklist_items_updated_at ON trip_checklist_items;
DROP FUNCTION IF EXISTS update_trip_checklist_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_trip_checklist_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trip_checklist_items_updated_at
  BEFORE UPDATE ON trip_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_checklist_updated_at();