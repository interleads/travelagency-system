import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OnDemandMilesPurchase } from "@/components/vendas/OnDemandMilesPurchaseModal";

export interface OnDemandPurchaseResult {
  supplierId: string;
  inventoryId: string;
  totalCost: number;
}

export const useOnDemandMilesPurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (purchase: OnDemandMilesPurchase): Promise<OnDemandPurchaseResult> => {
      let supplierId = purchase.supplier.id;
      
      // Create supplier if new
      if (purchase.supplier.isNew) {
        const { data: newSupplier, error: supplierError } = await supabase
          .from("suppliers")
          .insert([{
            name: purchase.supplier.name,
            contact: purchase.supplier.contact,
            program: purchase.supplier.program,
            account_type: purchase.supplier.account_type,
            status: 'Ativo'
          }])
          .select()
          .single();

        if (supplierError) throw supplierError;
        supplierId = newSupplier.id;
      }

      // Calculate purchase value
      const purchase_value = (purchase.miles.quantity / 1000) * purchase.miles.cost_per_thousand;
      
      // Insert into miles_inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("miles_inventory")
        .insert([{
          program_id: purchase.miles.program_id,
          supplier_id: supplierId,
          quantity: purchase.miles.quantity,
          cost_per_thousand: purchase.miles.cost_per_thousand,
          purchase_date: purchase.miles.purchase_date,
          purchase_value,
          remaining_quantity: purchase.miles.quantity,
          status: 'Ativo'
        }])
        .select()
        .single();
      
      if (inventoryError) throw inventoryError;

      // Insert miles transaction (purchase)
      const { error: milesTransactionError } = await supabase
        .from("miles_transactions")
        .insert([{
          miles_inventory_id: inventoryData.id,
          type: 'purchase',
          quantity: purchase.miles.quantity,
          cost_per_thousand: purchase.miles.cost_per_thousand,
          total_value: purchase_value,
          description: `Compra sob demanda - ${purchase.miles.quantity.toLocaleString()} milhas ${purchase.supplier.program}`
        }]);

      if (milesTransactionError) throw milesTransactionError;

      // Insert financial transaction (expense)
      const { error: financeError } = await supabase
        .from("transactions")
        .insert([{
          date: purchase.miles.purchase_date,
          description: `Compra milhas sob demanda - ${purchase.supplier.name} (${purchase.miles.quantity.toLocaleString()})`,
          type: 'despesa',
          category: 'Milhas',
          subcategory: 'Compra Sob Demanda',
          value: purchase_value
        }]);

      if (financeError) throw financeError;

      return {
        supplierId: supplierId!,
        inventoryId: inventoryData.id,
        totalCost: purchase_value
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["miles_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};