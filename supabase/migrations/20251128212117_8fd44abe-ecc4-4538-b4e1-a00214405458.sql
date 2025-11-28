-- Create function to automatically complete referrals when booking is completed
CREATE OR REPLACE FUNCTION public.auto_complete_referral_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_guide_id UUID;
  v_referral_signup_id UUID;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get the guide_id for this booking's tour
    SELECT guide_id INTO v_guide_id
    FROM tours
    WHERE id = NEW.tour_id;
    
    -- Check if this guide has a pending referral signup (completed milestone_2 but not final completion)
    SELECT id INTO v_referral_signup_id
    FROM referral_signups
    WHERE user_id = v_guide_id
      AND user_type = 'guide'
      AND milestone_2_at IS NOT NULL
      AND completed_at IS NULL
    LIMIT 1;
    
    -- If there's a pending referral, mark it as completed
    IF v_referral_signup_id IS NOT NULL THEN
      UPDATE referral_signups
      SET 
        completed_at = NOW(),
        completion_booking_id = NEW.id,
        reward_status = 'pending',
        updated_at = NOW()
      WHERE id = v_referral_signup_id;
      
      -- Log for debugging
      RAISE NOTICE 'Auto-completed referral % for guide % with booking %', 
        v_referral_signup_id, v_guide_id, NEW.id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on bookings table
DROP TRIGGER IF EXISTS trigger_auto_complete_referral ON bookings;
CREATE TRIGGER trigger_auto_complete_referral
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_referral_on_booking();

-- Add comment
COMMENT ON FUNCTION public.auto_complete_referral_on_booking() IS 
  'Automatically marks guide referral signups as completed when their first booking is completed';