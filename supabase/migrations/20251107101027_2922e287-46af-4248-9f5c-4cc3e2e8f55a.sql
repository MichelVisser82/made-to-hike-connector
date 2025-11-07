-- Tax documents table
CREATE TABLE IF NOT EXISTS tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  gross_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fees NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(guide_id, year)
);

-- RLS Policies
ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides can view own tax documents"
  ON tax_documents FOR SELECT
  USING (auth.uid() = guide_id);

CREATE POLICY "Guides can insert own tax documents"
  ON tax_documents FOR INSERT
  WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Guides can update own tax documents"
  ON tax_documents FOR UPDATE
  USING (auth.uid() = guide_id);

-- Indexes
CREATE INDEX idx_tax_documents_guide_year ON tax_documents(guide_id, year);

-- Updated at trigger
CREATE TRIGGER update_tax_documents_updated_at
  BEFORE UPDATE ON tax_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();