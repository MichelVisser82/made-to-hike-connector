-- Create guide-documents storage bucket for certificate documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guide-documents',
  'guide-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
);

-- RLS Policies for guide-documents bucket

-- Guides can upload their own documents
CREATE POLICY "Guides can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'guide-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Guides can view their own documents
CREATE POLICY "Guides can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'guide-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Guides can update their own documents
CREATE POLICY "Guides can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'guide-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Guides can delete their own documents
CREATE POLICY "Guides can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'guide-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all guide documents
CREATE POLICY "Admins can view all guide documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'guide-documents'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);