-- Add locator field to sale_products table
ALTER TABLE public.sale_products 
ADD COLUMN locator TEXT;