import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "@/components/shared/useDateRangeFilter";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'receita' | 'despesa';
  category: string;
  subcategory?: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  date: string;
  description: string;
  type: 'receita' | 'despesa';
  category: string;
  subcategory?: string;
  value: number;
}

export const useTransactions = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["transactions", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*");

      // Apply date filter if dateRange is provided
      if (dateRange?.from) {
        query = query.gte("date", dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        query = query.lte("date", dateRange.to.toISOString().split('T')[0]);
      }

      query = query.order("date", { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: TransactionInput) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert([transaction])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const { error } = await supabase
        .from("transactions")
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};