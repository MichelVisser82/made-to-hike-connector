-- Seed data for Step 3: Location - Regions
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step3', 'region', 'Dolomites, Italy - Dramatic limestone peaks', 1, true),
('step3', 'region', 'Pyrenees - France-Spain border range', 2, true),
('step3', 'region', 'Scottish Highlands - Rugged mountain terrain', 3, true),
('step3', 'region', 'Swiss Alps - Iconic Alpine scenery', 4, true),
('step3', 'region', 'Norwegian Fjords - Dramatic coastal mountains', 5, true);

-- Seed data for Step 4: Difficulty Levels
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step4-difficulty', 'difficulty', 'A - Easy | Suitable for beginners, gentle terrain', 1, true),
('step4-difficulty', 'difficulty', 'B - Moderate | Some hiking experience required', 2, true),
('step4-difficulty', 'difficulty', 'C - Challenging | For experienced hikers, steep sections', 3, true),
('step4-difficulty', 'difficulty', 'D - Expert | Very demanding, technical skills needed', 4, true);

-- Seed data for Step 4: Duration Options
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step4-duration', 'duration', '1 day', 1, true),
('step4-duration', 'duration', '2 days', 2, true),
('step4-duration', 'duration', '3 days', 3, true),
('step4-duration', 'duration', '4 days', 4, true),
('step4-duration', 'duration', '5 days', 5, true),
('step4-duration', 'duration', '6 days', 6, true),
('step4-duration', 'duration', '7 days', 7, true),
('step4-duration', 'duration', '10 days', 8, true),
('step4-duration', 'duration', '14 days', 9, true);

-- Seed data for Step 5: Terrain Types
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step5', 'terrain', 'Rocky trails', 1, true),
('step5', 'terrain', 'Forest paths', 2, true),
('step5', 'terrain', 'Alpine meadows', 3, true),
('step5', 'terrain', 'Glacier crossings', 4, true),
('step5', 'terrain', 'Scree slopes', 5, true),
('step5', 'terrain', 'Ridge walks', 6, true),
('step5', 'terrain', 'Valley floors', 7, true),
('step5', 'terrain', 'Mountain passes', 8, true);

-- Seed data for Step 8: Highlights
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step8', 'highlight', 'Stunning sunrise views from mountain peaks', 1, true),
('step8', 'highlight', 'Wildlife spotting opportunities', 2, true),
('step8', 'highlight', 'Local mountain cuisine experience', 3, true),
('step8', 'highlight', 'Expert guide with local knowledge', 4, true),
('step8', 'highlight', 'Small group for personalized experience', 5, true),
('step8', 'highlight', 'Panoramic mountain vistas', 6, true),
('step8', 'highlight', 'Cultural heritage sites', 7, true),
('step8', 'highlight', 'Photography opportunities', 8, true);

-- Seed data for Step 9: Activities
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step9', 'activity', 'Summit attempt', 1, true),
('step9', 'activity', 'Ridge traverse', 2, true),
('step9', 'activity', 'Valley exploration', 3, true),
('step9', 'activity', 'Alpine lake visit', 4, true),
('step9', 'activity', 'Glacier crossing', 5, true),
('step9', 'activity', 'Wildlife observation', 6, true),
('step9', 'activity', 'Photography session', 7, true),
('step9', 'activity', 'Mountain hut experience', 8, true);

-- Seed data for Step 9: Accommodations
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step9', 'accommodation', 'Mountain hut', 1, true),
('step9', 'accommodation', 'Alpine refuge', 2, true),
('step9', 'accommodation', 'Hotel', 3, true),
('step9', 'accommodation', 'Camping', 4, true),
('step9', 'accommodation', 'Guesthouse', 5, true),
('step9', 'accommodation', 'Dormitory', 6, true);

-- Seed data for Step 9: Meals
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step9', 'meal', 'Breakfast', 1, true),
('step9', 'meal', 'Lunch', 2, true),
('step9', 'meal', 'Dinner', 3, true),
('step9', 'meal', 'Packed lunch', 4, true),
('step9', 'meal', 'Snacks', 5, true);

-- Seed data for Step 11: Currency Options
INSERT INTO public.tour_step_templates (step_name, category, item_text, sort_order, is_active) VALUES
('step11', 'currency', 'EUR', 1, true),
('step11', 'currency', 'GBP', 2, true),
('step11', 'currency', 'USD', 3, true),
('step11', 'currency', 'CHF', 4, true);
