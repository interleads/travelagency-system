-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update existing profiles with emails from auth.users
-- This will be done via a function to avoid permission issues
CREATE OR REPLACE FUNCTION public.sync_profile_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be called manually to sync emails
  -- For now, we'll handle this in the application layer
  RETURN;
END;
$$;