-- Add fields to bookings table for trip preparation tracking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS waiver_uploaded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS insurance_uploaded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS insurance_file_url TEXT,
ADD COLUMN IF NOT EXISTS participants_details JSONB DEFAULT '[]'::jsonb;

-- Create trip_checklist_items table
CREATE TABLE IF NOT EXISTS trip_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('essential_gear', 'personal_items', 'documents', 'preparation')),
  item_name TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on trip_checklist_items
ALTER TABLE trip_checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for trip_checklist_items
CREATE POLICY "Users can view their own checklist items"
  ON trip_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = trip_checklist_items.booking_id
      AND bookings.hiker_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own checklist items"
  ON trip_checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = trip_checklist_items.booking_id
      AND bookings.hiker_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own checklist items"
  ON trip_checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = trip_checklist_items.booking_id
      AND bookings.hiker_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_trip_checklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trip_checklist_items_updated_at
  BEFORE UPDATE ON trip_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_checklist_updated_at();