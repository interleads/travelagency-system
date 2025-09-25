import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupplierPurchase {
  id: string;
  quantity: number;
  purchase_date: string;
  purchase_value: number;
  cost_per_thousand: number;
  status: string;
  remaining_quantity: number;
  program_id: string;
  programs?: {
    name: string;
  };
}

export interface SupplierStats {
  totalPurchases: number;
  totalValue: number;
  totalQuantity: number;
  averageCostPerThousand: number;
  mostUsedProgram: string;
  lastPurchaseDate?: string;
}

export const useSupplierPurchaseHistory = (supplierId: string) => {
  return useQuery({
    queryKey: ["supplier-purchase-history", supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("miles_inventory")
        .select(`
          id,
          quantity,
          purchase_date,
          purchase_value,
          cost_per_thousand,
          status,
          remaining_quantity,
          program_id,
          programs:program_id (
            name
          )
        `)
        .eq("supplier_id", supplierId)
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!supplierId,
  });
};

export const useSupplierStats = (supplierId: string) => {
  return useQuery({
    queryKey: ["supplier-stats", supplierId],
    queryFn: async (): Promise<SupplierStats> => {
      const { data, error } = await supabase
        .from("miles_inventory")
        .select(`
          quantity,
          purchase_value,
          cost_per_thousand,
          purchase_date,
          programs:program_id (
            name
          )
        `)
        .eq("supplier_id", supplierId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalPurchases: 0,
          totalValue: 0,
          totalQuantity: 0,
          averageCostPerThousand: 0,
          mostUsedProgram: "Nenhum",
        };
      }

      const totalPurchases = data.length;
      const totalValue = data.reduce((sum, item) => sum + Number(item.purchase_value), 0);
      const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
      const averageCostPerThousand = totalValue > 0 ? totalValue / (totalQuantity / 1000) : 0;

      // Find most used program
      const programCounts = data.reduce((acc: Record<string, number>, item) => {
        const programName = item.programs?.name || "Desconhecido";
        acc[programName] = (acc[programName] || 0) + 1;
        return acc;
      }, {});
      
      const mostUsedProgram = Object.entries(programCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || "Nenhum";

      const lastPurchaseDate = data
        .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0]
        ?.purchase_date;

      return {
        totalPurchases,
        totalValue,
        totalQuantity,
        averageCostPerThousand,
        mostUsedProgram,
        lastPurchaseDate,
      };
    },
    enabled: !!supplierId,
  });
};