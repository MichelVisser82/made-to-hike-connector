-- Remove hiker role and set guide verification to approved
DELETE FROM public.user_roles 
WHERE user_id = 'fff8cf91-e3e2-4dbd-b54f-bb3fa822542b' 
AND role = 'hiker'::app_role;

-- Update verification status to approved for guide
UPDATE public.user_verifications 
SET verification_status = 'approved'::verification_status,
    updated_at = now()
WHERE user_id = 'fff8cf91-e3e2-4dbd-b54f-bb3fa822542b';