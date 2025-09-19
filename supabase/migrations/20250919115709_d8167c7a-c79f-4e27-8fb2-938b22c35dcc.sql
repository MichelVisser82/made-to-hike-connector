-- Add RLS policy for kv_store table (this appears to be a system table)
CREATE POLICY "Allow authenticated users to access kv_store" ON public.kv_store_158bb0c0
  FOR ALL USING (auth.role() = 'authenticated');