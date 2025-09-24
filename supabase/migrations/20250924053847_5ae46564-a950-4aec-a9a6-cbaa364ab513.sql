-- First make supplier_id nullable in miles_inventory
ALTER TABLE public.miles_inventory 
ALTER COLUMN supplier_id DROP NOT NULL;

-- Update miles programs to match the new requirement
UPDATE public.miles_programs SET name = 'Azul' WHERE name = 'Azul Fidelidade';
UPDATE public.miles_programs SET name = 'Latam' WHERE name = 'LATAM Pass';
DELETE FROM public.miles_programs WHERE name IN ('Livelo', 'TudoAzul');

-- Insert TAP if it doesn't exist
INSERT INTO public.miles_programs (name) 
SELECT 'TAP' 
WHERE NOT EXISTS (SELECT 1 FROM public.miles_programs WHERE name = 'TAP');

-- Insert Outros if it doesn't exist  
INSERT INTO public.miles_programs (name) 
SELECT 'Outros' 
WHERE NOT EXISTS (SELECT 1 FROM public.miles_programs WHERE name = 'Outros');