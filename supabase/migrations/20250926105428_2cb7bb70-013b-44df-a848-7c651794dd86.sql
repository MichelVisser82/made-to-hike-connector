-- Create storage buckets for website images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('website-images', 'website-images', true),
  ('hero-images', 'hero-images', true),
  ('tour-images', 'tour-images', true);

-- Create RLS policies for website images bucket
CREATE POLICY "Public can view website images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'website-images');

CREATE POLICY "Admins can upload website images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'website-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update website images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'website-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete website images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'website-images' AND has_role(auth.uid(), 'admin'));

-- Create RLS policies for hero images bucket
CREATE POLICY "Public can view hero images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'hero-images');

CREATE POLICY "Admins can upload hero images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hero images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hero images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'hero-images' AND has_role(auth.uid(), 'admin'));

-- Create RLS policies for tour images bucket  
CREATE POLICY "Public can view tour images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tour-images');

CREATE POLICY "Admins can upload tour images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tour-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tour images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tour-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tour images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tour-images' AND has_role(auth.uid(), 'admin'));

-- Create a table to store image metadata and categorization
CREATE TABLE public.website_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hero', 'landscape', 'hiking', 'portrait', 'detail', etc.
  tags TEXT[] DEFAULT '{}',
  alt_text TEXT,
  description TEXT,
  usage_context TEXT[], -- 'landing', 'tours', 'about', 'contact', etc.
  priority INTEGER DEFAULT 0, -- Higher numbers = higher priority for selection
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on website_images table
ALTER TABLE public.website_images ENABLE ROW LEVEL SECURITY;

-- Create policies for website_images table
CREATE POLICY "Anyone can view active website images" 
ON public.website_images 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage website images" 
ON public.website_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_website_images_updated_at
BEFORE UPDATE ON public.website_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();