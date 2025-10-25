-- Migration 1: Expand reviews table for comprehensive review system

-- Add review system columns to existing reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_type TEXT CHECK (review_type IN ('hiker_to_guide', 'guide_to_hiker'));
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft' CHECK (review_status IN ('draft', 'submitted', 'published', 'expired', 'void'));
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reminder_sent_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS highlight_tags TEXT[] DEFAULT '{}';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS category_ratings JSONB;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS quick_assessment JSONB;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS private_safety_notes TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS paired_review_id UUID REFERENCES reviews(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Rename 'rating' to 'overall_rating' for clarity
ALTER TABLE reviews RENAME COLUMN rating TO overall_rating;

-- Update existing reviews to be published (grandfather old data)
UPDATE reviews 
SET review_status = 'published', 
    review_type = 'hiker_to_guide', 
    published_at = created_at 
WHERE review_status IS NULL;

-- Add trigger to update updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_status_expires ON reviews(review_status, expires_at);
CREATE INDEX IF NOT EXISTS idx_reviews_paired ON reviews(paired_review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_guide_status ON reviews(guide_id, review_status);
CREATE INDEX IF NOT EXISTS idx_reviews_hiker_status ON reviews(hiker_id, review_status);