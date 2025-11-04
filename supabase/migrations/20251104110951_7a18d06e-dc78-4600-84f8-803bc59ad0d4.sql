-- Add decline reason and review fields to user_submitted_regions
ALTER TABLE user_submitted_regions
ADD COLUMN IF NOT EXISTS declined_reason TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_submitted_regions_status 
ON user_submitted_regions(verification_status);

CREATE INDEX IF NOT EXISTS idx_user_submitted_regions_submitted_by 
ON user_submitted_regions(submitted_by);

-- Add function to handle region decline and tour archiving
CREATE OR REPLACE FUNCTION handle_region_decline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a region is declined, archive all tours that use this region
  IF NEW.verification_status = 'declined' AND OLD.verification_status != 'declined' THEN
    -- Find and archive tours that match this region
    UPDATE tours
    SET 
      is_active = false,
      updated_at = NOW()
    WHERE guide_id = NEW.submitted_by
      AND (
        region = (
          CASE 
            WHEN NEW.region IS NOT NULL THEN NEW.country || ' - ' || NEW.region || ' - ' || NEW.subregion
            ELSE NEW.country || ' - ' || NEW.subregion
          END
        )
      );
  END IF;
  
  -- When a region is approved, reactivate tours if they were archived due to region issues
  IF NEW.verification_status = 'approved' AND OLD.verification_status != 'approved' THEN
    -- We don't auto-reactivate tours as guides should review them first
    -- Just log that the region was approved
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for region decline handling
DROP TRIGGER IF EXISTS trigger_handle_region_decline ON user_submitted_regions;
CREATE TRIGGER trigger_handle_region_decline
AFTER UPDATE ON user_submitted_regions
FOR EACH ROW
EXECUTE FUNCTION handle_region_decline();