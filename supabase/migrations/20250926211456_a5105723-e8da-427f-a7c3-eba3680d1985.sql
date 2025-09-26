-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('administrador', 'vendedor');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'vendedor',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile and admins can view all"
ON public.profiles FOR SELECT
USING (
  id = auth.uid() OR 
  public.has_role(auth.uid(), 'administrador')
);

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Users can update their own profile and admins can update all"
ON public.profiles FOR UPDATE
USING (
  id = auth.uid() OR 
  public.has_role(auth.uid(), 'administrador')
);

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Update existing table policies to respect roles
-- Update clients policies
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;

CREATE POLICY "Authenticated users can view clients"
ON public.clients FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert clients"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update clients"
ON public.clients FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Update sales policies
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can delete sales" ON public.sales;

CREATE POLICY "Authenticated users can view sales"
ON public.sales FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert sales"
ON public.sales FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sales"
ON public.sales FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete sales"
ON public.sales FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Update transactions policies (admin only)
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON public.transactions;

CREATE POLICY "Admins can view transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can insert transactions"
ON public.transactions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete transactions"
ON public.transactions FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Update suppliers policies (admin only)
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can delete suppliers" ON public.suppliers;

CREATE POLICY "Admins can view suppliers"
ON public.suppliers FOR SELECT
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can insert suppliers"
ON public.suppliers FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update suppliers"
ON public.suppliers FOR UPDATE
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete suppliers"
ON public.suppliers FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Update miles policies (admin only)
DROP POLICY IF EXISTS "Authenticated users can view miles_inventory" ON public.miles_inventory;
DROP POLICY IF EXISTS "Authenticated users can insert miles_inventory" ON public.miles_inventory;
DROP POLICY IF EXISTS "Authenticated users can update miles_inventory" ON public.miles_inventory;
DROP POLICY IF EXISTS "Authenticated users can delete miles_inventory" ON public.miles_inventory;

CREATE POLICY "Admins can view miles_inventory"
ON public.miles_inventory FOR SELECT
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can insert miles_inventory"
ON public.miles_inventory FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update miles_inventory"
ON public.miles_inventory FOR UPDATE
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete miles_inventory"
ON public.miles_inventory FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Add timestamp trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();