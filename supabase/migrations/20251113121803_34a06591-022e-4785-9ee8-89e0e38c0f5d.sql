-- Normalize all dietary preferences to lowercase and remove duplicates
UPDATE profiles 
SET dietary_preferences = (
  SELECT jsonb_agg(DISTINCT lower(value::text))
  FROM jsonb_array_elements_text(dietary_preferences) AS value
)
WHERE jsonb_typeof(dietary_preferences) = 'array' 
  AND jsonb_array_length(dietary_preferences) > 0;