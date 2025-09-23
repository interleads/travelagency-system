-- Create suppliers table for miles suppliers management
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  account_type TEXT NOT NULL,
  program TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  notes TEXT,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers (public access for this travel system)
CREATE POLICY "Anyone can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create suppliers" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update suppliers" 
ON public.suppliers 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete suppliers" 
ON public.suppliers 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();