-- Step 1: Create user_role enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('administrador', 'vendedor');
    END IF;
END $$;

-- Step 2: Ensure profiles table has correct structure
ALTER TABLE public.profiles 
    ALTER COLUMN role SET DEFAULT 'vendedor'::user_role;

-- Step 3: Create or replace the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Step 4: Create or replace handle_new_user function
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
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN user_count = 0 THEN 'administrador'::user_role ELSE 'vendedor'::user_role END
  );
  
  RETURN NEW;
END;
$$;

-- Step 5: Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Insert profile for current authenticated user if missing
-- This will be the first user, so they'll be admin
INSERT INTO public.profiles (id, full_name, role)
SELECT 
  auth.uid(),
  'Administrador',
  'administrador'::user_role
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());