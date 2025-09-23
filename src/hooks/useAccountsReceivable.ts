import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AccountReceivable {
  id: string;
  sale_id: string;
  client_name: string;
  description: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'received';
  received_at?: string;
  created_at: string;
}

export const useAccountsReceivable = () => {
  return useQuery({
    queryKey: ["accounts_receivable"],
    queryFn: async () => {
      // Buscar vendas parceladas (installments > 1)
      const { data: sales, error } = await supabase
        .from("sales")
        .select("*")
        .gt("installments", 1)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Gerar parcelas para cada venda
      const receivables: AccountReceivable[] = [];
      
      sales?.forEach(sale => {
        const installmentAmount = sale.total_amount / sale.installments;
        
        for (let i = 1; i <= sale.installments; i++) {
          const saleDate = new Date(sale.created_at);
          const dueDate = new Date(saleDate);
          dueDate.setMonth(dueDate.getMonth() + i);

          receivables.push({
            id: `${sale.id}-${i}`,
            sale_id: sale.id,
            client_name: sale.client_name,
            description: `Parcela ${i}/${sale.installments} - Venda ${sale.client_name}`,
            installment_number: i,
            total_installments: sale.installments,
            amount: installmentAmount,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pending',
            created_at: sale.created_at
          });
        }
      });

      return receivables.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    }
  });
};

export const useMarkAsReceived = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ receivableId, amount }: { receivableId: string; amount: number }) => {
      const [saleId, installmentNumber] = receivableId.split('-');
      
      // Criar transação de receita
      const { error } = await supabase
        .from("transactions")
        .insert([{
          date: new Date().toISOString().split('T')[0],
          description: `Recebimento parcela ${installmentNumber} - ${receivableId}`,
          type: 'receita',
          category: 'Recebimentos',
          value: amount
        }]);

      if (error) throw error;
      
      return { receivableId, received_at: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts_receivable"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};