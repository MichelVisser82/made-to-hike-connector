-- Complete import of all hiking regions from CSV data

INSERT INTO hiking_regions (country, region, subregion, description, key_features, is_active) VALUES
-- Albania (4 regions)
('Albania', NULL, 'Albanian Alps (Prokletije)', 'Traditional mountain villages with dramatic limestone peaks', ARRAY['Theth National Park', 'Valbona Valley', 'Peaks of the Balkans Trail (192km)', 'Jezercë peak (2694m)'], true),
('Albania', NULL, 'Via Dinarica - Albanian Section', 'Cross-border Balkan mega-trail', ARRAY['White Trail', 'Gashi River Valley UNESCO', 'Remote villages', 'Authentic culture'], true),
('Albania', NULL, 'Llogara Pass', 'Mediterranean to mountain transition', ARRAY['Albanian Riviera views', 'Coastal to alpine', 'Dramatic scenery'], true),
('Albania', NULL, 'Tomorr Mountain', 'Sacred pilgrimage peak with panoramic views', ARRAY['Religious significance', 'Panoramic views', 'Hiking pilgrimage'], true),

-- Austria (22 regions)
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
('Austria', 'Vorarlberg', 'Rätikon Range', 'Border ridges with Switzerland and Liechtenstein', ARRAY['Limestone walls', 'Cross-border', 'Alpine'], true),
('Austria', 'Styria (Steiermark)', 'Schladming-Dachstein', 'Styrian Alps with famous hut-to-hut trails', ARRAY['Schladminger Tauern High Trail (5-7 days)', 'Mountain cuisine', 'Giglachseen lakes'], true),
('Austria', 'Styria (Steiermark)', 'Gesäuse National Park', 'Dramatic limestone cliffs and river valley', ARRAY['Enns river', 'Climbing paradise', 'Steep walls'], true),
('Austria', 'Carinthia (Kärnten)', 'Nockberge Biosphere Reserve', 'Gentle rounded peaks with wellness focus', ARRAY['Alpine pastures', 'Wellness', 'Rounded peaks'], true),
('Austria', 'Carinthia (Kärnten)', 'Hohe Tauern (Carinthian side)', 'Großglockner from the southern approach', ARRAY['Mölltal Glacier', 'Southern access', 'Alpine'], true),

-- Bosnia & Herzegovina (6 regions)
('Bosnia & Herzegovina', NULL, 'Sutjeska National Park', 'Primeval forest and highest peak of BiH', ARRAY['Perućica forest (primeval)', 'Maglić (2386m)', 'WWII history'], true),
('Bosnia & Herzegovina', NULL, 'Prenj Mountain', 'The Herzegovinian Himalayas', ARRAY['Dramatic karst', 'Zelena Glava peak', 'Remote', 'Challenging'], true),
('Bosnia & Herzegovina', NULL, 'Bjelašnica & Jahorina', '1984 Winter Olympics mountains near Sarajevo', ARRAY['Sarajevo access', 'Ski heritage', 'War history'], true),
('Bosnia & Herzegovina', NULL, 'Čvrsnica Mountain', 'Limestone massif with diverse flora', ARRAY['Shepherd huts', 'Karst', 'Traditional'], true),
('Bosnia & Herzegovina', NULL, 'Via Dinarica Sections', 'Balkan mega-trail crossing Bosnia', ARRAY['White/Green/Blue routes', 'Cross-cultural', 'Multi-country'], true),
('Bosnia & Herzegovina', NULL, 'Medieval Tombstones (Stećci)', 'UNESCO monuments along mountain trails', ARRAY['UNESCO', 'Historical', 'Cultural heritage'], true),

-- Belgium (3 regions)
('Belgium', NULL, 'Ardennes', 'Forested rolling hills with WWII history', ARRAY['Battle of Bulge sites', 'Gentle terrain', 'Forests', 'Historical'], true),
('Belgium', NULL, 'High Fens (Hautes Fagnes)', 'Highest Belgian plateau with moorland', ARRAY['Boardwalks', 'Unique ecosystem', 'Wetlands', 'Nature reserve'], true),
('Belgium', NULL, 'Semois Valley', 'River valley with forests and castles', ARRAY['River meanders', 'Medieval castles', 'Scenic'], true),

-- Croatia (13 regions)
('Croatia', NULL, 'Plitvice Lakes National Park', '16 cascading turquoise lakes with boardwalks', ARRAY['Wooden boardwalks', 'UNESCO', 'Waterfalls', 'Travertine'], true),
('Croatia', NULL, 'Paklenica National Park', 'Dramatic gorges and climbing paradise', ARRAY['Velika & Mala Paklenica', 'Rock climbing', 'Canyons', 'Velebit'], true),
('Croatia', NULL, 'Velebit Mountain', 'Engineered high-altitude trail masterpiece', ARRAY['Premužić Trail (57km)', 'Zavižan Observatory', 'Botanical reserve'], true),
('Croatia', NULL, 'Northern Velebit National Park', 'Strict nature reserve with diverse flora', ARRAY['Rossi''s Trail', 'Protected', 'Karst', 'Endemic species'], true),
('Croatia', NULL, 'Risnjak National Park', 'Karst landscape with brown bear habitat', ARRAY['Brown bear', 'Leska trail', 'Educational', 'Wildlife'], true),
('Croatia', NULL, 'Biokovo Nature Park', 'Coastal mountain range above Makarska Riviera', ARRAY['Sveti Jure peak (1762m)', 'Coastal views', 'Mediterranean'], true),
('Croatia', 'Dalmatian Islands', 'Hvar Island', 'Lavender island with coastal trails', ARRAY['Lavender fields', 'Historic towns', 'Mediterranean', 'Coastal'], true),
('Croatia', 'Dalmatian Islands', 'Brač Island', 'Highest Adriatic island peak', ARRAY['Vidova Gora (778m)', 'Zlatni Rat beach', 'Stone quarries'], true),
('Croatia', 'Dalmatian Islands', 'Korčula Island', 'Marco Polo heritage with coastal paths', ARRAY['Marco Polo', 'Medieval towns', 'Coastal trails'], true),
('Croatia', 'Dalmatian Islands', 'Mljet National Park', 'Island with saltwater lakes and monastery', ARRAY['Monastery island', 'Kayaking', 'Forest trails', 'Peaceful'], true),
('Croatia', NULL, 'Krka National Park', 'Waterfalls with swimming areas', ARRAY['Waterfalls', 'Swimming', 'Boardwalks', 'River'], true),
('Croatia', NULL, 'Učka Nature Park', 'Istrian peninsula mountain', ARRAY['Alps and Adriatic views', 'Peninsula', 'Panoramic'], true),

-- Continue with remaining countries...
-- Cyprus (3 regions)
('Cyprus', NULL, 'Troodos Mountains', 'Byzantine churches in pine forests', ARRAY['Mount Olympus (1952m)', 'UNESCO churches', 'Wine villages', 'Cultural'], true),
('Cyprus', NULL, 'Akamas Peninsula', 'Coastal wilderness reserve with sea turtles', ARRAY['Aphrodite Trail', 'Avakas Gorge', 'Sea turtles', 'Remote'], true),
('Cyprus', NULL, 'Caledonia Waterfall Trail', 'Scenic forest path to highest waterfall', ARRAY['Forest trail', 'Waterfall', 'Accessible'], true),

-- Czech Republic (6 regions)
('Czech Republic', NULL, 'Bohemian Switzerland (České Švýcarsko)', 'Sandstone formations with largest natural arch', ARRAY['Pravčická brána (arch)', 'Hřebenovka trail', 'Elbe sandstone', 'Climbing'], true),
('Czech Republic', NULL, 'Krkonoše (Giant Mountains)', 'Highest Czech peaks with alpine meadows', ARRAY['Sněžka (1603m)', 'Alpine meadows', 'Mountain huts', 'Cross-border'], true),
('Czech Republic', NULL, 'Jeseníky Mountains', 'Spa towns combined with mountain hiking', ARRAY['Praded (1491m)', 'Bila Opava trail', 'Waterfalls', 'Spa heritage'], true),
('Czech Republic', NULL, 'Šumava (Bohemian Forest)', 'Dense primeval forests along German border', ARRAY['Boubín forest', 'Devil''s Lake', 'Border region', 'Wilderness'], true),
('Czech Republic', NULL, 'Beskydy Mountains', 'Carpathian foothills with wooden architecture', ARRAY['Traditional architecture', 'Carpathian', 'Cultural'], true),
('Czech Republic', NULL, 'Bohemian Paradise (Český ráj)', 'Sandstone rock towns with castles', ARRAY['Castles', 'UNESCO Geopark', 'Rock formations', 'History'], true),

-- Denmark (6 regions)
('Denmark', NULL, 'Møns Klint', 'Dramatic white chalk cliffs on Baltic Sea', ARRAY['128m cliffs', 'Baltic Sea', 'Fossil hunting', 'Coastal'], true),
('Denmark', NULL, 'Bornholm Island', 'Rocky island with round churches', ARRAY['Coastal paths', 'Hammeren cliffs', 'Medieval churches', 'Danish Baltic'], true),
('Denmark', NULL, 'Camønoen Trail', '175km historic coastal route', ARRAY['Villages', 'History', 'Coast', 'Cultural'], true),
('Denmark', NULL, 'Thy National Park', 'Wild coastal dunes and beaches', ARRAY['Wild beaches', 'Cold War bunkers', 'Windswept', 'North Sea'], true),
('Denmark', NULL, 'Mols Bjerge National Park', 'Rolling hills with Bronze Age heritage', ARRAY['Coastal heathland', 'Bronze Age mounds', 'Gentle', 'Historical'], true),
('Denmark', NULL, 'Rold Forest', 'Denmark''s largest forest area', ARRAY['Hills', 'Forest', 'Wildlife'], true),

-- Estonia (4 regions)
('Estonia', NULL, 'Lahemaa National Park', 'Baltic coast with manor houses', ARRAY['Bog boardwalks', 'Forests', 'Cultural heritage', 'Coastal'], true),
('Estonia', NULL, 'Soomaa National Park', 'Fifth season flooding wilderness', ARRAY['Canoeing', 'Bog walking', 'Unique ecosystem', 'Seasonal flooding'], true),
('Estonia', NULL, 'Karula National Park', 'Hills and lakes in rural setting', ARRAY['Rural landscapes', 'Lakes', 'Peaceful'], true),
('Estonia', NULL, 'Haanja Nature Park', 'Highest point in the Baltics', ARRAY['Suur Munamägi (318m)', 'Observation tower', 'Baltic high point'], true),

-- Finland (6 regions)
('Finland', NULL, 'Lapland', 'Arctic fell landscapes with midnight sun', ARRAY['Urho Kekkonen Park', 'Midnight sun', 'Northern lights', 'Reindeer'], true),
('Finland', NULL, 'Koli National Park', 'Iconic Finnish landscape views', ARRAY['Lake Pielinen', 'Ukko-Koli summit', 'National symbol', 'Panoramic'], true),
('Finland', NULL, 'Nuuksio National Park', 'Accessible wilderness near Helsinki', ARRAY['Forests', 'Lakes', 'Urban proximity', 'Day trips'], true),
('Finland', NULL, 'Oulanka National Park', 'Bear''s Ring trail through wilderness', ARRAY['Karhunkierros (80km)', 'Rapids', 'Remote', 'Wildlife'], true),
('Finland', NULL, 'Pallas-Yllästunturi National Park', 'Clearest air in Europe with fell terrain', ARRAY['Fell landscapes', 'Autumn colors', 'Pure air', 'Remote'], true),
('Finland', NULL, 'Archipelago National Park', 'Island hopping with coastal trails', ARRAY['Maritime', 'Island hopping', 'Kayaking', 'Coastal'], true)

ON CONFLICT (country, region, subregion) DO UPDATE SET
  description = EXCLUDED.description,
  key_features = EXCLUDED.key_features,
  is_active = EXCLUDED.is_active,
  updated_at = now();