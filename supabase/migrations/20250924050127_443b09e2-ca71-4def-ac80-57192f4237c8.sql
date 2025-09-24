-- Remove o trigger temporariamente
DROP TRIGGER IF EXISTS update_miles_inventory_trigger ON miles_transactions;

-- Recria a função com search_path correto
DROP FUNCTION IF EXISTS public.update_remaining_miles();

CREATE OR REPLACE FUNCTION public.update_remaining_miles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
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
$function$;

-- Recria o trigger
CREATE TRIGGER update_miles_inventory_trigger
  AFTER INSERT ON miles_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_remaining_miles();