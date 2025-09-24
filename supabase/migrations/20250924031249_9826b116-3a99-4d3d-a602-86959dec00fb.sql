-- Create sale_installments table for individual installment tracking
CREATE TABLE public.sale_installments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  due_date date NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  paid_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sale_installments ENABLE ROW LEVEL SECURITY;

-- Create policies for sale_installments
CREATE POLICY "Anyone can manage sale installments" 
ON public.sale_installments 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sale_installments_updated_at
BEFORE UPDATE ON public.sale_installments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_sale_installments_sale_id ON public.sale_installments(sale_id);
CREATE INDEX idx_sale_installments_status ON public.sale_installments(status);
CREATE INDEX idx_sale_installments_due_date ON public.sale_installments(due_date);