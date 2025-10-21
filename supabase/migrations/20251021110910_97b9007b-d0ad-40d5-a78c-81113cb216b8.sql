-- Drop the existing foreign key from tours.guide_id to profiles.id
ALTER TABLE tours 
DROP CONSTRAINT IF EXISTS tours_guide_id_fkey;

-- Add new foreign key from tours.guide_id to guide_profiles.user_id
-- This correctly links tours to guide profiles through the user_id
ALTER TABLE tours
ADD CONSTRAINT tours_guide_id_fkey 
FOREIGN KEY (guide_id) 
REFERENCES guide_profiles(user_id)
ON DELETE CASCADE;

-- Create an index on guide_profiles.user_id for better join performance
CREATE INDEX IF NOT EXISTS idx_guide_profiles_user_id 
ON guide_profiles(user_id);