-- Add sale_date column to sales table
ALTER TABLE public.sales 
ADD COLUMN sale_date DATE DEFAULT CURRENT_DATE;