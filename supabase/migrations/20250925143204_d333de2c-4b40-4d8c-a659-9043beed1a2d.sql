-- Module 1: Add supplier_id to sale_products table
ALTER TABLE public.sale_products 
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);

-- Create index for better query performance
CREATE INDEX idx_sale_products_supplier_id ON public.sale_products(supplier_id);

-- Update trigger to automatically update supplier last_used when used in sales
CREATE OR REPLACE FUNCTION public.update_supplier_last_used()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.supplier_id IS NOT NULL THEN
    UPDATE public.suppliers 
    SET last_used = now(),
        updated_at = now()
    WHERE id = NEW.supplier_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic supplier last_used updates
CREATE TRIGGER update_supplier_last_used_trigger
  BEFORE INSERT OR UPDATE ON public.sale_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supplier_last_used();