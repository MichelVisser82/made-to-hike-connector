-- Add first_name and last_name columns to profiles table
ALTER TABLE profiles 
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Migrate existing name data to first_name and last_name
UPDATE profiles 
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE 
    WHEN array_length(string_to_array(name, ' '), 1) > 1 
    THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END
WHERE name IS NOT NULL AND name != '';