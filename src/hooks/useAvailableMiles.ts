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