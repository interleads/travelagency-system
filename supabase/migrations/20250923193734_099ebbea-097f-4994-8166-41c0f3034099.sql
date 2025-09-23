-- Create miles programs table
CREATE TABLE public.miles_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default programs
INSERT INTO public.miles_programs (name) VALUES 
('Smiles'),
('LATAM Pass'),
('TudoAzul'),
('Livelo'),
('Azul Fidelidade');

-- Create miles inventory table
CREATE TABLE public.miles_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.miles_programs(id),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  quantity INTEGER NOT NULL,
  cost_per_thousand DECIMAL(10,2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  purchase_value DECIMAL(10,2) NOT NULL,
  remaining_quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT remaining_quantity_check CHECK (remaining_quantity >= 0),
  CONSTRAINT remaining_less_than_total CHECK (remaining_quantity <= quantity)
);

-- Create miles transactions table
CREATE TABLE public.miles_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  miles_inventory_id UUID REFERENCES public.miles_inventory(id),
  sale_id UUID,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment')),
  quantity INTEGER NOT NULL,
  cost_per_thousand DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  installments INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  miles_used INTEGER,
  miles_cost DECIMAL(10,2),
  supplier_id UUID REFERENCES public.suppliers(id),
  gross_profit DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales products table
CREATE TABLE public.sale_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  airline TEXT,
  passengers TEXT,
  origin TEXT,
  destination TEXT,
  departure_date DATE,
  return_date DATE,
  miles INTEGER,
  miles_cost DECIMAL(8,2),
  checkin_date DATE,
  checkout_date DATE,
  vehicle_category TEXT,
  rental_period TEXT,
  coverage_type TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for finance module
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL,
  subcategory TEXT,
  value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.miles_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miles_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miles_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now since no auth)
CREATE POLICY "Anyone can manage miles programs" ON public.miles_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage miles inventory" ON public.miles_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage miles transactions" ON public.miles_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage sale products" ON public.sale_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_miles_programs_updated_at
  BEFORE UPDATE ON public.miles_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_miles_inventory_updated_at
  BEFORE UPDATE ON public.miles_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update remaining quantity when miles are used
CREATE OR REPLACE FUNCTION public.update_remaining_miles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'sale' AND NEW.miles_inventory_id IS NOT NULL THEN
    UPDATE public.miles_inventory 
    SET remaining_quantity = remaining_quantity - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.miles_inventory_id;
    
    -- Update status if inventory is depleted
    UPDATE public.miles_inventory 
    SET status = 'Esgotado'
    WHERE id = NEW.miles_inventory_id AND remaining_quantity <= 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic inventory updates
CREATE TRIGGER update_miles_inventory_trigger
  AFTER INSERT ON public.miles_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_remaining_miles();