-- Create storage policies for website-images bucket
CREATE POLICY "Admins can upload to website-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'website-images' 
  AND has_role(auth.uid(), 'admin'::text)
);

CREATE POLICY "Admins can update website-images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'website-images' 
  AND has_role(auth.uid(), 'admin'::text)
);

CREATE POLICY "Anyone can view website-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'website-images');

-- Create storage policies for hero-images bucket
CREATE POLICY "Admins can upload to hero-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'hero-images' 
  AND has_role(auth.uid(), 'admin'::text)
);

CREATE POLICY "Admins can update hero-images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'hero-images' 
  AND has_role(auth.uid(), 'admin'::text)
);

CREATE POLICY "Anyone can view hero-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'hero-images');

-- Create storage policies for tour-images bucket
CREATE POLICY "Guides can upload to tour-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'tour-images' 
  AND (has_role(auth.uid(), 'guide'::text) OR has_role(auth.uid(), 'admin'::text))
);

CREATE POLICY "Guides can update tour-images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'tour-images' 
  AND (has_role(auth.uid(), 'guide'::text) OR has_role(auth.uid(), 'admin'::text))
);

CREATE POLICY "Anyone can view tour-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tour-images');