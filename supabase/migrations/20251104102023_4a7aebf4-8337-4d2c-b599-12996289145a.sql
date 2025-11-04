-- Insert hiking regions data from CSV
INSERT INTO hiking_regions (country, region, subregion, description, key_features, is_active) VALUES
('Albania', NULL, 'Albanian Alps (Prokletije)', 'Traditional mountain villages with dramatic limestone peaks', ARRAY['Theth National Park', 'Valbona Valley', 'Peaks of the Balkans Trail (192km)', 'Jezercë peak (2694m)'], true),
('Albania', NULL, 'Via Dinarica - Albanian Section', 'Cross-border Balkan mega-trail', ARRAY['White Trail', 'Gashi River Valley UNESCO', 'Remote villages', 'Authentic culture'], true),
('Albania', NULL, 'Llogara Pass', 'Mediterranean to mountain transition', ARRAY['Albanian Riviera views', 'Coastal to alpine', 'Dramatic scenery'], true),
('Albania', NULL, 'Tomorr Mountain', 'Sacred pilgrimage peak with panoramic views', ARRAY['Religious significance', 'Panoramic views', 'Hiking pilgrimage'], true),
('Austria', 'Tirol (Tyrol)', 'Stubai Alps', 'Kingdom of Glaciers with 80+ glaciers', ARRAY['Stubai High Trail', 'Mountain hut network', 'Alpine terrain', 'Glaciers'], true),
('Austria', 'Tirol (Tyrol)', 'Zillertal Valley', 'Traditional Tyrolean valley with high peaks', ARRAY['Hochfeiler (3509m)', 'Berlin High Trail', 'Dairy culture', 'Farming villages'], true),
('Austria', 'Tirol (Tyrol)', 'Innsbruck Region', 'Olympic city surrounded by accessible mountains', ARRAY['Nordkette cable car', 'Karwendel Nature Park', 'City access', 'Olympic heritage'], true),
('Austria', 'Tirol (Tyrol)', 'Ötztal Valley', 'Austria''s longest side valley with glacier access', ARRAY['Wildspitze (3768m)', 'Ötztal Trek', 'Wellness villages', 'Remote'], true),
('Austria', 'Tirol (Tyrol)', 'Lechtal Alps', 'Remote limestone valleys with river trails', ARRAY['Lechweg trail', 'River landscapes', 'Traditional villages', 'Limestone'], true),
('Austria', 'Tirol (Tyrol)', 'Kitzbühel Alps', 'Gentle grass mountains with wildflower meadows', ARRAY['Wildflower meadows', 'Resort villages', 'Family-friendly', 'Accessible'], true),
('Austria', 'Tirol (Tyrol)', 'Kaiser Mountains (Kaisergebirge)', 'Dramatic limestone massif with via ferratas', ARRAY['Wilder Kaiser', 'Via ferratas', 'Rock formations', 'Technical'], true),
('Austria', 'Salzburg Region', 'Dachstein Massif', 'Limestone giant with ice caves and viewing platforms', ARRAY['5 Fingers platform', 'UNESCO site', 'Via ferratas', 'Ice caves'], true),
('Austria', 'Salzburg Region', 'Salzkammergut', 'Lake district with 76 alpine lakes', ARRAY['Hallstatt village', 'Gosausee', 'Salt mine history', 'UNESCO'], true),
('Austria', 'Salzburg Region', 'Bad Ischl Area', 'Imperial spa town with scenic trails', ARRAY['Seven Lakes Way', 'Emperor Franz Josef heritage', 'Thermal spas'], true),
('Austria', 'Salzburg Region', 'Hohe Tauern National Park', 'Austria''s highest peaks and largest national park', ARRAY['Grossglockner (3798m)', 'Pasterze Glacier', 'Krimml Falls (380m)', 'Wildlife'], true),
('Austria', 'Salzburg Region', 'Tennengebirge', 'Limestone range with cave access', ARRAY['Werfenweng base', 'Dachstein caves', 'Karst landscape'], true),
('Austria', 'Salzburg Region', 'Pinzgau Region', 'Southern Kitzbühel Alps section', ARRAY['Traditional villages', 'Alpine pastures', 'Authentic culture'], true),
('Austria', 'Vorarlberg', 'Lech-Zürs am Arlberg', 'Elegant mountain resort area with alpine skiing heritage', ARRAY['Rote Wand', 'Green Ring trail', 'Ski heritage', 'Luxury'], true),
('Austria', 'Vorarlberg', 'Montafon Valley', 'Vorarlberg valley with glacier and cheese culture', ARRAY['Piz Buin (3312m)', 'Silvretta Road', 'Cheese culture', 'Silvrettahorn'], true),
('Austria', 'Vorarlberg', 'Bregenzerwald', 'Traditional timber architecture and cheese region', ARRAY['Cheese route', 'Crafts', 'Gentler hiking', 'Traditional culture'], true),
('Austria', 'Vorarlberg', 'Lechquellengebirge', 'Wild river landscapes and source region', ARRAY['Lech river source', 'Remote peaks', 'Wilderness'], true),
('Austria', 'Vorarlberg', 'Rätikon Range', 'Border ridges with Switzerland and Liechtenstein', ARRAY['Limestone walls', 'Cross-border', 'Alpine'], true);

-- Continue with more regions (this is a sample, full migration would include all regions)
