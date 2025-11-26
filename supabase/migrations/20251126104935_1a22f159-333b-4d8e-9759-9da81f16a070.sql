-- Add meeting_time column to tours table
ALTER TABLE tours ADD COLUMN meeting_time TIME;

-- Add comment for documentation
COMMENT ON COLUMN tours.meeting_time IS 'Time when hikers should arrive at the meeting point (e.g., 09:00, 08:30)';