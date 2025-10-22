-- Tour map settings table
CREATE TABLE tour_map_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE UNIQUE NOT NULL,
  show_meeting_point BOOLEAN DEFAULT true,
  route_display_mode VARCHAR(50) DEFAULT 'region_overview',
  region_center_lat DECIMAL(10,7),
  region_center_lng DECIMAL(10,7),
  region_radius_km DECIMAL(10,2),
  featured_highlight_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Day routes with GPS data
CREATE TABLE tour_day_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  route_coordinates JSONB NOT NULL,
  distance_km DECIMAL(10,2),
  elevation_gain_m INTEGER,
  elevation_loss_m INTEGER,
  estimated_duration_hours DECIMAL(4,2),
  elevation_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tour_id, day_number)
);

-- Interactive highlights
CREATE TABLE tour_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  elevation_m INTEGER,
  is_public BOOLEAN DEFAULT false,
  guide_notes TEXT,
  photos JSONB DEFAULT '[]',
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GPX file storage metadata
CREATE TABLE tour_gpx_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE UNIQUE NOT NULL,
  original_filename VARCHAR(500) NOT NULL,
  storage_path TEXT NOT NULL,
  total_distance_km DECIMAL(10,2),
  total_elevation_gain_m INTEGER,
  total_points INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tour_map_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_day_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_gpx_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_map_settings
CREATE POLICY "Anyone can view map settings"
  ON tour_map_settings FOR SELECT
  USING (true);

CREATE POLICY "Guides can manage their tour map settings"
  ON tour_map_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tours 
      WHERE tours.id = tour_map_settings.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all map settings"
  ON tour_map_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::text));

-- RLS Policies for tour_day_routes
CREATE POLICY "Guides can view their tour routes"
  ON tour_day_routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tours 
      WHERE tours.id = tour_day_routes.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Hikers with confirmed bookings can view routes"
  ON tour_day_routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.tour_id = tour_day_routes.tour_id 
      AND bookings.hiker_id = auth.uid()
      AND bookings.status IN ('confirmed', 'completed')
    )
  );

CREATE POLICY "Guides can manage their tour routes"
  ON tour_day_routes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tours 
      WHERE tours.id = tour_day_routes.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all routes"
  ON tour_day_routes FOR ALL
  USING (has_role(auth.uid(), 'admin'::text));

-- RLS Policies for tour_highlights
CREATE POLICY "Anyone can view public highlights"
  ON tour_highlights FOR SELECT
  USING (is_public = true);

CREATE POLICY "Guides can view all their tour highlights"
  ON tour_highlights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tours 
      WHERE tours.id = tour_highlights.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Hikers with confirmed bookings can view all highlights"
  ON tour_highlights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.tour_id = tour_highlights.tour_id 
      AND bookings.hiker_id = auth.uid()
      AND bookings.status IN ('confirmed', 'completed')
    )
  );

CREATE POLICY "Guides can manage their tour highlights"
  ON tour_highlights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tours 
      WHERE tours.id = tour_highlights.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all highlights"
  ON tour_highlights FOR ALL
  USING (has_role(auth.uid(), 'admin'::text));

-- RLS Policies for tour_gpx_files
CREATE POLICY "Guides can view their tour GPX files"
  ON tour_gpx_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tours 
      WHERE tours.id = tour_gpx_files.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Guides can manage their tour GPX files"
  ON tour_gpx_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tours 
      WHERE tours.id = tour_gpx_files.tour_id 
      AND tours.guide_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all GPX files"
  ON tour_gpx_files FOR ALL
  USING (has_role(auth.uid(), 'admin'::text));

-- Triggers for updated_at
CREATE TRIGGER update_tour_map_settings_updated_at
  BEFORE UPDATE ON tour_map_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_day_routes_updated_at
  BEFORE UPDATE ON tour_day_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_highlights_updated_at
  BEFORE UPDATE ON tour_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();