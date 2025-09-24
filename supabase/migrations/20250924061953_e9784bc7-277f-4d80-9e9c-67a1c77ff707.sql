-- Add notes field to sales table for storing descriptions from CSV import
ALTER TABLE public.sales 
ADD COLUMN notes TEXT;