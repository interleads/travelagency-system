-- Primeiro, remove parcelas duplicadas mantendo apenas a primeira de cada grupo
DELETE FROM sale_installments 
WHERE id NOT IN (
    SELECT DISTINCT ON (sale_id, installment_number) id 
    FROM sale_installments 
    ORDER BY sale_id, installment_number, created_at ASC
);

-- Adiciona constraint única para prevenir futuras duplicações
ALTER TABLE sale_installments 
ADD CONSTRAINT unique_sale_installment 
UNIQUE (sale_id, installment_number);