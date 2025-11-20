-- Add deprecation comment and trigger for backward compatibility
-- This ensures the old 'region' column stays in sync with new structured columns

COMMENT ON COLUMN tours.region IS 'DEPRECATED: Legacy region field. Use region_country, region_region, and region_subregion instead. Auto-populated via trigger for backward compatibility.';

-- Create function to auto-populate legacy region field
CREATE OR REPLACE FUNCTION sync_legacy_region_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate the old region field from structured columns
  -- Format: country-subregion (e.g., "italy-dolomites", "scotland-highlands")
  NEW.region := LOWER(
    REGEXP_REPLACE(
      CONCAT(
        NEW.region_country,
        '-',
        COALESCE(NEW.region_region || '-', ''),
        NEW.region_subregion
      ),
      '[^a-z0-9-]',
      '',
      'gi'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync on insert/update
DROP TRIGGER IF EXISTS sync_legacy_region_trigger ON tours;
CREATE TRIGGER sync_legacy_region_trigger
  BEFORE INSERT OR UPDATE OF region_country, region_region, region_subregion
  ON tours
  FOR EACH ROW
  EXECUTE FUNCTION sync_legacy_region_column();