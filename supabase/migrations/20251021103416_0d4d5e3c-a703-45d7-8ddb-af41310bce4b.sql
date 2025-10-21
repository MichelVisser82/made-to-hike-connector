-- Migration 5: Create validate_discount_code function
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_tour_id UUID,
  p_guide_id UUID,
  p_subtotal NUMERIC
)
RETURNS TABLE(
  is_valid BOOLEAN,
  discount_amount NUMERIC,
  error_message TEXT
) AS $$
DECLARE
  v_discount discount_codes%ROWTYPE;
  v_calculated_discount NUMERIC;
BEGIN
  -- Fetch discount code
  SELECT * INTO v_discount FROM discount_codes WHERE code = p_code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Invalid discount code';
    RETURN;
  END IF;
  
  -- Check validity dates
  IF v_discount.valid_from > NOW() THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Discount code not yet valid';
    RETURN;
  END IF;
  
  IF v_discount.valid_until IS NOT NULL AND v_discount.valid_until < NOW() THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Discount code has expired';
    RETURN;
  END IF;
  
  -- Check max uses
  IF v_discount.max_uses IS NOT NULL AND v_discount.times_used >= v_discount.max_uses THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Discount code has reached maximum uses';
    RETURN;
  END IF;
  
  -- Check minimum purchase
  IF v_discount.min_purchase_amount IS NOT NULL AND p_subtotal < v_discount.min_purchase_amount THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Purchase amount does not meet minimum requirement';
    RETURN;
  END IF;
  
  -- Check scope and applicability
  IF v_discount.scope = 'guide' THEN
    IF v_discount.guide_id != p_guide_id THEN
      RETURN QUERY SELECT false, 0::NUMERIC, 'Discount code not valid for this guide';
      RETURN;
    END IF;
    
    IF v_discount.applicable_tour_ids IS NOT NULL AND NOT (p_tour_id = ANY(v_discount.applicable_tour_ids)) THEN
      RETURN QUERY SELECT false, 0::NUMERIC, 'Discount code not valid for this tour';
      RETURN;
    END IF;
  END IF;
  
  -- Calculate discount
  IF v_discount.discount_type = 'percentage' THEN
    v_calculated_discount := p_subtotal * (v_discount.discount_value / 100);
  ELSE
    v_calculated_discount := v_discount.discount_value;
  END IF;
  
  -- Ensure discount doesn't exceed subtotal
  v_calculated_discount := LEAST(v_calculated_discount, p_subtotal);
  
  RETURN QUERY SELECT true, v_calculated_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;