import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SaleInstallment {
  id: string;
  sale_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export const useInstallments = (saleId: string) => {
  return useQuery({
    queryKey: ["installments", saleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_installments")
        .select("*")
        .eq("sale_id", saleId)
        .order("installment_number");
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useCreateInstallments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      saleId,
      installments,
      totalAmount,
      firstDueDate
    }: {
      saleId: string;
      installments: number;
      totalAmount: number;
      firstDueDate: Date;
    }) => {
      const installmentAmount = totalAmount / installments;
      const installmentsData = [];

      for (let i = 1; i <= installments; i++) {
        const dueDate = new Date(firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        
        installmentsData.push({
          sale_id: saleId,
          installment_number: i,
          due_date: dueDate.toISOString().split('T')[0],
          amount: installmentAmount,
          status: 'pending'
        });
      }

      const { data, error } = await supabase
        .from("sale_installments")
        .insert(installmentsData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};

export const usePayInstallment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (installmentId: string) => {
      const { data, error } = await supabase
        .from("sale_installments")
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq("id", installmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};

export const useUpdateInstallment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string;
      updates: Partial<SaleInstallment>;
    }) => {
      const { data, error } = await supabase
        .from("sale_installments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};