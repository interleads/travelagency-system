-- Add cost field to sale_products table
ALTER TABLE sale_products ADD COLUMN cost numeric DEFAULT 0;

-- Add anticipation fields to sales table
ALTER TABLE sales ADD COLUMN has_anticipation boolean DEFAULT false;
ALTER TABLE sales ADD COLUMN anticipation_date date;