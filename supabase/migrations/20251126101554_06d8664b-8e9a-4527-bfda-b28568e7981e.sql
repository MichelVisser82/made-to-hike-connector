-- Fix incorrectly tagged images

-- 1. Remove Saas-Fee from Dolomites (it's in Switzerland)
UPDATE website_images 
SET tags = ARRAY['location:switzerland-valais', 'saas-fee', 'alpine', 'mountain']
WHERE id = 'd2314531-c920-4fc1-954f-bce5ea53fe4b';

-- 2. Fix duplicate IMG_0113.jpg - replace Dolomites tag with Pyrenees
UPDATE website_images 
SET tags = array_append(array_remove(tags, 'location:italy-dolomites'), 'location:spain-pyrenees')
WHERE id = 'c4f35493-eb3f-48db-bea4-5e4c94a57c28' 
  AND 'location:italy-dolomites' = ANY(tags);

-- 3. Fix duplicate IMG_0106.jpg - replace Dolomites tag with Pyrenees
UPDATE website_images 
SET tags = array_append(array_remove(tags, 'location:italy-dolomites'), 'location:spain-pyrenees')
WHERE id = '426fcd63-93d5-4517-9378-f4dcddab0868'
  AND 'location:italy-dolomites' = ANY(tags);