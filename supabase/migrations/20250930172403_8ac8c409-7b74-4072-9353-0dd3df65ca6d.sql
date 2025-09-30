-- Migration: Change portfolio_images from URL array to ID array referencing website_images
-- This enables portfolio images to be managed through the website_images system

-- Step 1: Drop the default value first to allow type change
ALTER TABLE guide_profiles 
  ALTER COLUMN portfolio_images DROP DEFAULT;

-- Step 2: Change the column type to accept UUIDs instead of text URLs
ALTER TABLE guide_profiles 
  ALTER COLUMN portfolio_images TYPE uuid[] USING array[]::uuid[];

-- Step 3: Set new default as empty UUID array
ALTER TABLE guide_profiles 
  ALTER COLUMN portfolio_images SET DEFAULT array[]::uuid[];

-- Step 4: Add a comment to document the new structure
COMMENT ON COLUMN guide_profiles.portfolio_images IS 'Array of website_images.id references for portfolio photos';

-- Step 5: Add index for better query performance when joining with website_images
CREATE INDEX IF NOT EXISTS idx_guide_profiles_portfolio_images ON guide_profiles USING GIN (portfolio_images);
