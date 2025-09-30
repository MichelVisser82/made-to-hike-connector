-- Make uploaded_by non-nullable in website_images (set default for existing nulls first)
UPDATE website_images 
SET uploaded_by = (SELECT id FROM auth.users LIMIT 1)
WHERE uploaded_by IS NULL;

-- Now alter the column to be non-nullable
ALTER TABLE website_images 
ALTER COLUMN uploaded_by SET NOT NULL;

-- Add index for efficient guide-based queries
CREATE INDEX IF NOT EXISTS idx_website_images_uploaded_by 
ON website_images(uploaded_by);

-- Add index for guide + category queries
CREATE INDEX IF NOT EXISTS idx_website_images_guide_category 
ON website_images(uploaded_by, category) 
WHERE is_active = true;

-- Create RLS policy for guides to view their own images
CREATE POLICY "Guides can view their own images"
ON website_images
FOR SELECT
TO authenticated
USING (uploaded_by = auth.uid());

-- Create RLS policy for guides to manage their own images
CREATE POLICY "Guides can insert their own images"
ON website_images
FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Guides can update their own images"
ON website_images
FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid());

CREATE POLICY "Guides can delete their own images"
ON website_images
FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());