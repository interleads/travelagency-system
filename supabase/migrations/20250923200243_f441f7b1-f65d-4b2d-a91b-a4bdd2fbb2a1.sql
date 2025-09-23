-- Limpar dados fictícios do sistema

-- 1. Remover transações de milhas relacionadas a vendas fictícias
DELETE FROM public.miles_transactions 
WHERE sale_id IN (
  SELECT id FROM public.sales 
  WHERE client_name ILIKE '%fulano%' 
     OR client_name ILIKE '%joão%' 
     OR client_name ILIKE '%maria%' 
     OR client_name ILIKE '%pedro%'
     OR client_name ILIKE '%teste%'
);

-- 2. Remover produtos de vendas fictícias
DELETE FROM public.sale_products 
WHERE sale_id IN (
  SELECT id FROM public.sales 
  WHERE client_name ILIKE '%fulano%' 
     OR client_name ILIKE '%joão%' 
     OR client_name ILIKE '%maria%' 
     OR client_name ILIKE '%pedro%'
     OR client_name ILIKE '%teste%'
);

-- 3. Remover vendas fictícias
DELETE FROM public.sales 
WHERE client_name ILIKE '%fulano%' 
   OR client_name ILIKE '%joão%' 
   OR client_name ILIKE '%maria%' 
   OR client_name ILIKE '%pedro%'
   OR client_name ILIKE '%teste%';

-- 4. Remover transações fictícias (manter apenas as que foram criadas automaticamente pelo sistema)
DELETE FROM public.transactions 
WHERE description ILIKE '%teste%'
   OR description ILIKE '%exemplo%'
   OR description ILIKE '%demo%'
   OR (type = 'receita' AND category = 'Vendas' AND description NOT ILIKE '%venda%');