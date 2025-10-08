-- Create guide-videos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('guide-videos', 'guide-videos', true);

-- RLS policies for guide-videos bucket
CREATE POLICY "Guides can upload their own videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'guide-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Guides can view their own videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'guide-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Guides can update their own videos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'guide-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Guides can delete their own videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'guide-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view public videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'guide-videos');

-- Add video metadata fields to guide_profiles
ALTER TABLE guide_profiles
ADD COLUMN IF NOT EXISTS video_type text CHECK (video_type IN ('upload', 'external')),
ADD COLUMN IF NOT EXISTS intro_video_file_path text,
ADD COLUMN IF NOT EXISTS intro_video_size_bytes bigint,
ADD COLUMN IF NOT EXISTS intro_video_duration_seconds integer;