-- Update sender_name for existing messages where it's an email address
-- This fixes messages where sender_name was set to email instead of actual name

UPDATE messages m
SET sender_name = p.name
FROM profiles p
WHERE m.sender_id = p.id
  AND m.sender_id IS NOT NULL
  AND m.sender_name LIKE '%@%'
  AND p.name IS NOT NULL
  AND p.name != '';