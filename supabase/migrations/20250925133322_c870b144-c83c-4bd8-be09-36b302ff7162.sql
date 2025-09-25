-- Adicionar coluna fornecedor à tabela sale_products
ALTER TABLE public.sale_products 
ADD COLUMN fornecedor text;