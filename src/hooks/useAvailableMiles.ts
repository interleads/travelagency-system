import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAvailableMilesByProgram = () => {
  return useQuery({
    queryKey: ["available_miles_by_program"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("miles_inventory")
        .select(`
          program_id,
          remaining_quantity,
          status,
          miles_programs!inner (name)
        `)
        .eq("status", "Ativo")
        .gt("remaining_quantity", 0);
      
      if (error) throw error;
      
      // Group by program and sum remaining quantities
      const programBalances: Record<string, { name: string; total: number }> = {};
      
      data?.forEach(item => {
        if (!programBalances[item.program_id]) {
          programBalances[item.program_id] = {
            name: item.miles_programs?.name || 'Programa sem nome',
            total: 0
          };
        }
        programBalances[item.program_id].total += item.remaining_quantity;
      });
      
      return programBalances;
    }
  });
};

export const useAvailableMilesForProgram = (programId: string | null) => {
  return useQuery({
    queryKey: ["available_miles_for_program", programId],
    queryFn: async () => {
      if (!programId) return 0;
      
      const { data, error } = await supabase
        .from("miles_inventory")
        .select("remaining_quantity")
        .eq("program_id", programId)
        .eq("status", "Ativo")
        .gt("remaining_quantity", 0);
      
      if (error) throw error;
      
      return data?.reduce((total, item) => total + item.remaining_quantity, 0) || 0;
    },
    enabled: !!programId
  });
};

export const useNextAvailableBatch = (programId: string | null, requiredQuantity: number) => {
  return useQuery({
    queryKey: ["next_available_batch", programId, requiredQuantity],
    queryFn: async () => {
      if (!programId || requiredQuantity <= 0) return null;
      
      const { data, error } = await supabase
        .from("miles_inventory")
        .select("id, remaining_quantity, cost_per_thousand, purchase_date")
        .eq("program_id", programId)
        .eq("status", "Ativo")
        .gt("remaining_quantity", 0)
        .order("purchase_date", { ascending: true }); // FIFO - mais antigos primeiro
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      let remainingRequired = requiredQuantity;
      let totalCost = 0;
      
      for (const batch of data) {
        if (remainingRequired <= 0) break;
        
        const quantityFromBatch = Math.min(remainingRequired, batch.remaining_quantity);
        const costFromBatch = (quantityFromBatch / 1000) * batch.cost_per_thousand;
        
        totalCost += costFromBatch;
        remainingRequired -= quantityFromBatch;
      }
      
      if (remainingRequired > 0) {
        // Não há estoque suficiente
        return null;
      }
      
      // Retorna o custo médio por mil
      return (totalCost / requiredQuantity) * 1000;
    },
    enabled: !!programId && requiredQuantity > 0
  });
};