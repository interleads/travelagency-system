-- Add tax-related columns to sale_products table
ALTER TABLE public.sale_products 
ADD COLUMN tax_value numeric,
ADD COLUMN card_taxes text;