-- Upsert admin profile for current user so RLS allows viewing suppliers, inventory and transactions
INSERT INTO public.profiles (id, full_name, role, is_active)
VALUES ('4d255467-70b9-4884-b0a5-1b65bea247e2', 'Administrador', 'administrador', true)
ON CONFLICT (id) DO UPDATE 
SET role = 'administrador', is_active = true, full_name = EXCLUDED.full_name, updated_at = now();