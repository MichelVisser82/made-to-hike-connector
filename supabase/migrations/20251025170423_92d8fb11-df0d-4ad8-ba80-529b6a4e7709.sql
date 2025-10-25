-- Link the paired reviews and publish them since both are submitted
UPDATE reviews 
SET paired_review_id = 'bb28ebdb-33d0-464c-bdba-18698e40ff38'
WHERE id = '0a8b711e-d7a6-49a9-9d7a-36abfdc37ab6';

UPDATE reviews 
SET paired_review_id = '0a8b711e-d7a6-49a9-9d7a-36abfdc37ab6'
WHERE id = 'bb28ebdb-33d0-464c-bdba-18698e40ff38';

-- Since both are submitted, publish them now
UPDATE reviews
SET review_status = 'published', published_at = now()
WHERE id IN ('0a8b711e-d7a6-49a9-9d7a-36abfdc37ab6', 'bb28ebdb-33d0-464c-bdba-18698e40ff38');