-- Add difficulty_levels field to guide_profiles table
ALTER TABLE guide_profiles 
ADD COLUMN IF NOT EXISTS difficulty_levels text[] DEFAULT '{}';

COMMENT ON COLUMN guide_profiles.difficulty_levels IS 'Array of difficulty levels the guide can handle: beginner, intermediate, advanced, expert';