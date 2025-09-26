-- Check current storage policies and simplify them for debugging
DROP POLICY IF EXISTS "Admins can upload to website-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update website-images" ON storage.objects;

-- Create simpler policies for authenticated users to debug
CREATE POLICY "Authenticated users can upload to website-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'website-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update website-images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'website-images' 
  AND auth.role() = 'authenticated'
);

-- Do the same for other buckets temporarily
DROP POLICY IF EXISTS "Admins can upload to hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero-images" ON storage.objects;

CREATE POLICY "Authenticated users can upload to hero-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update hero-images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);