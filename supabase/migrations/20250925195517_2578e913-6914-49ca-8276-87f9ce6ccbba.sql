-- Update the handle_new_user trigger to store hiker-specific metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    
    -- Create verification record with role-specific metadata
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
      -- Create verification record for hikers with their specific metadata
      INSERT INTO public.user_verifications (
        user_id,
        admin_notes
      ) VALUES (
        NEW.id,
        CASE 
          WHEN NEW.raw_user_meta_data->>'phone' IS NOT NULL OR 
               NEW.raw_user_meta_data->>'emergency_contact' IS NOT NULL OR 
               NEW.raw_user_meta_data->>'emergency_phone' IS NOT NULL 
          THEN 
            COALESCE('Phone: ' || (NEW.raw_user_meta_data->>'phone'), '') ||
            CASE WHEN NEW.raw_user_meta_data->>'emergency_contact' IS NOT NULL 
              THEN ' | Emergency Contact: ' || (NEW.raw_user_meta_data->>'emergency_contact') 
              ELSE '' 
            END ||
            CASE WHEN NEW.raw_user_meta_data->>'emergency_phone' IS NOT NULL 
              THEN ' | Emergency Phone: ' || (NEW.raw_user_meta_data->>'emergency_phone') 
              ELSE '' 
            END
          ELSE NULL
        END
      );
    END IF;
  END;
  
  RETURN NEW;
END;
$$;