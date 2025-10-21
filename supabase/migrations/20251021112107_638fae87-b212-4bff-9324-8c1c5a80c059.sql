-- Add missing columns to kv_store_158bb0c0
ALTER TABLE public.kv_store_158bb0c0 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes');

ALTER TABLE public.kv_store_158bb0c0 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on expires_at if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_kv_store_158bb0c0_expires_at 
ON public.kv_store_158bb0c0(expires_at);