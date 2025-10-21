-- Create kv_store table for temporary verification codes and other key-value storage
CREATE TABLE IF NOT EXISTS public.kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on expires_at for efficient cleanup and queries
CREATE INDEX IF NOT EXISTS idx_kv_store_expires_at 
ON public.kv_store(expires_at);

-- Enable RLS (service role bypasses RLS automatically)
ALTER TABLE public.kv_store ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to access kv_store (for edge functions using service role)
CREATE POLICY "Allow authenticated users to access kv_store"
ON public.kv_store
FOR ALL
USING (auth.role() = 'authenticated');

-- Function to clean up expired entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_kv_store()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.kv_store
  WHERE expires_at < NOW();
END;
$$;