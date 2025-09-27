-- Remove any hardcoded users and fix the trigger function
DELETE FROM public.profiles WHERE id = 'c4c846c3-70d8-4b44-b560-abef575a108c';

-- Update the handle_new_user function to make first user admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if this is the first user (make them admin)
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Insert profile with role based on whether this is first user
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN user_count = 0 THEN 'administrador'::user_role ELSE 'vendedor'::user_role END
  );
  
  RETURN NEW;
END;
$$;