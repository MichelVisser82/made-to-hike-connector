-- Add is_featured column to guide_profiles for featured guides
ALTER TABLE guide_profiles 
ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Add index for performance on featured + verified queries
CREATE INDEX idx_guide_profiles_featured_verified ON guide_profiles(is_featured, verified) 
WHERE verified = true;

-- Update a few example guides to be featured (optional - admins can set this later)
COMMENT ON COLUMN guide_profiles.is_featured IS 'Marks guide as featured in the guides directory';
