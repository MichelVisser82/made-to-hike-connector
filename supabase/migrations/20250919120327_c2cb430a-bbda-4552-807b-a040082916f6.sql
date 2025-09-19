-- Update the handle_new_user function to handle additional metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert basic profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Get the role from metadata or default to hiker
  DECLARE
    user_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'hiker');
  BEGIN
    -- Assign role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role::app_role);
    
    -- Create verification record with additional metadata for guides
    IF user_role = 'guide' THEN
      INSERT INTO public.user_verifications (
        user_id,
        company_name,
        license_number,
        insurance_info,
        experience_years
      ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'license_number',
        NEW.raw_user_meta_data->>'insurance_info',
        COALESCE((NEW.raw_user_meta_data->>'experience_years')::INTEGER, 0)
      );
    ELSE
      -- Create basic verification record for hikers
      INSERT INTO public.user_verifications (user_id)
      VALUES (NEW.id);
    END IF;
  END;
  
  RETURN NEW;
END;
$$;