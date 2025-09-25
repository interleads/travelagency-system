import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClearAllTransactionalData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Clear in correct order due to foreign key dependencies
      
      // 1. Clear miles_transactions first (references miles_inventory)
      const { error: milesTransactionsError } = await supabase
        .from("miles_transactions")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (milesTransactionsError) throw milesTransactionsError;
      
      // 2. Clear miles_inventory
      const { error: milesInventoryError } = await supabase
        .from("miles_inventory")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (milesInventoryError) throw milesInventoryError;
      
      // 3. Clear all financial transactions
      const { error: transactionsError } = await supabase
        .from("transactions")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (transactionsError) throw transactionsError;
      
      // 4. Clear sale_products first (references sales)
      const { error: saleProductsError } = await supabase
        .from("sale_products")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (saleProductsError) throw saleProductsError;
      
      // 5. Clear sale_installments (references sales)
      const { error: saleInstallmentsError } = await supabase
        .from("sale_installments")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (saleInstallmentsError) throw saleInstallmentsError;
      
      // 6. Clear sales
      const { error: salesError } = await supabase
        .from("sales")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (salesError) throw salesError;
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["miles_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["miles_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale_products"] });
      queryClient.invalidateQueries({ queryKey: ["sale_installments"] });
    },
  });
};