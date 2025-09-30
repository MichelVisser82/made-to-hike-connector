-- Add hero_image column to tours table
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS hero_image TEXT;