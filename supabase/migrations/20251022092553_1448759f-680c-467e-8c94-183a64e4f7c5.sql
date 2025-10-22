-- Update the guide-documents storage bucket to allow XML and GPX files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/xml', 'application/xml', 'application/gpx+xml']
WHERE id = 'guide-documents';
