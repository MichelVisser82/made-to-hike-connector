-- Remove file size limit from guide-documents bucket
UPDATE storage.buckets 
SET file_size_limit = NULL 
WHERE id = 'guide-documents';