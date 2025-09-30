-- Add archived field to tours table
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;