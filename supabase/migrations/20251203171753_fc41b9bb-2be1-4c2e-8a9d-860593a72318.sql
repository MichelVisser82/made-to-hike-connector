-- Fix the deactivated guide's tours that weren't properly deactivated
UPDATE public.tours 
SET is_active = false, updated_at = now() 
WHERE guide_id = '93487995-df40-4765-9243-e2831abfaced';