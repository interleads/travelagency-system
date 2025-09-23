import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AccountPayable {
  id: string;
  supplier_name: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
  type: 'miles_purchase' | 'expense';
  reference_id?: string;
}

export const useAccountsPayable = () => {
  return useQuery({
    queryKey: ["accounts_payable"],
    queryFn: async () => {
      const payables: AccountPayable[] = [];

      // Buscar compras de milhas (da tabela miles_inventory)
      const { data: milesInventory, error: milesError } = await supabase
        .from("miles_inventory")
        .select(`
          *,
          suppliers (name)
        `)
        .order("created_at", { ascending: false });

      if (milesError) throw milesError;

      // Converter compras de milhas em contas a pagar
      milesInventory?.forEach(item => {
        const dueDate = new Date(item.purchase_date);
        dueDate.setDate(dueDate.getDate() + 30); // 30 dias para pagamento

        payables.push({
          id: `miles-${item.id}`,
          supplier_name: item.suppliers?.name || 'Fornecedor não informado',
          description: `Compra de milhas - ${item.quantity.toLocaleString()} milhas`,
          amount: item.purchase_value,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
          created_at: item.created_at,
          type: 'miles_purchase',
          reference_id: item.id
        });
      });

      // Buscar despesas da tabela transactions (tipo despesa)
      const { data: expenses, error: expensesError } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "despesa")
        .eq("category", "Fornecedores")
        .order("created_at", { ascending: false });

      if (expensesError) throw expensesError;

      // Converter despesas em contas a pagar
      expenses?.forEach(expense => {
        const dueDate = new Date(expense.date);
        dueDate.setDate(dueDate.getDate() + 30); // 30 dias para pagamento

        payables.push({
          id: `expense-${expense.id}`,
          supplier_name: expense.description.split('-')[1]?.trim() || 'Fornecedor',
          description: expense.description,
          amount: expense.value,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
          created_at: expense.created_at,
          type: 'expense',
          reference_id: expense.id
        });
      });

      return payables.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    }
  });
};

export const useMarkAsPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ payableId, amount }: { payableId: string; amount: number }) => {
      const [type, referenceId] = payableId.split('-');
      
      // Criar transação de despesa para o pagamento
      const { error } = await supabase
        .from("transactions")
        .insert([{
          date: new Date().toISOString().split('T')[0],
          description: `Pagamento - ${payableId}`,
          type: 'despesa',
          category: 'Pagamentos',
          value: amount
        }]);

      if (error) throw error;
      
      return { payableId, paid_at: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts_payable"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};