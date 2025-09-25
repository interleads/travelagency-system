import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "@/components/shared/useDateRangeFilter";

export interface MilesProgram {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MilesInventory {
  id: string;
  program_id: string;
  supplier_id?: string;
  quantity: number;
  cost_per_thousand: number;
  purchase_date: string;
  purchase_value: number;
  remaining_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
  miles_programs?: { name: string };
  suppliers?: { name: string };
}

export interface MilesPurchase {
  program_id: string;
  quantity: number;
  cost_per_thousand: number;
  purchase_date: string;
}

export const useMilesPrograms = () => {
  return useQuery({
    queryKey: ["miles_programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("miles_programs")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    }
  });
};

export const useMilesInventory = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["miles_inventory", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("miles_inventory")
        .select(`
          *,
          miles_programs (name),
          suppliers (name)
        `);

      // Apply date filter if dateRange is provided
      if (dateRange?.from) {
        query = query.gte("purchase_date", dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        query = query.lte("purchase_date", dateRange.to.toISOString().split('T')[0]);
      }

      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
};

export const useAddMilesPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (purchase: MilesPurchase) => {
      // Calculate purchase value
      const purchase_value = (purchase.quantity / 1000) * purchase.cost_per_thousand;
      
      // Insert into miles_inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("miles_inventory")
        .insert([{
          program_id: purchase.program_id,
          supplier_id: null,
          quantity: purchase.quantity,
          cost_per_thousand: purchase.cost_per_thousand,
          purchase_date: purchase.purchase_date,
          purchase_value,
          remaining_quantity: purchase.quantity,
          status: 'Ativo'
        }])
        .select()
        .single();
      
      if (inventoryError) throw inventoryError;

      // Insert transaction record
      const { error: transactionError } = await supabase
        .from("miles_transactions")
        .insert([{
          miles_inventory_id: inventoryData.id,
          type: 'purchase',
          quantity: purchase.quantity,
          cost_per_thousand: purchase.cost_per_thousand,
          total_value: purchase_value,
          description: `Compra de milhas - ${purchase.quantity.toLocaleString()}`
        }]);

      if (transactionError) throw transactionError;

      // Insert financial transaction (expense)
      const { error: financeError } = await supabase
        .from("transactions")
        .insert([{
          date: purchase.purchase_date,
          description: `Compra de milhas - ${purchase.quantity.toLocaleString()}`,
          type: 'despesa',
          category: 'Milhas',
          value: purchase_value
        }]);

      if (financeError) throw financeError;

      return inventoryData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miles_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateMilesInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MilesInventory> & { id: string }) => {
      const { error } = await supabase
        .from("miles_inventory")
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miles_inventory"] });
    },
  });
};

export const useDeleteMilesInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("miles_inventory")
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miles_inventory"] });
    },
  });
};