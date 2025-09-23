import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Sale {
  id: string;
  client_name: string;
  payment_method: string;
  installments: number;
  total_amount: number;
  miles_used?: number;
  miles_cost?: number;
  supplier_id?: string;
  gross_profit?: number;
  created_at: string;
  updated_at: string;
  suppliers?: { name: string };
}

export interface SaleProduct {
  id?: string;
  sale_id?: string;
  type: string;
  name: string;
  quantity: number;
  price: number;
  airline?: string;
  passengers?: string;
  origin?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  miles?: number;
  miles_cost?: number;
  checkin_date?: string;
  checkout_date?: string;
  vehicle_category?: string;
  rental_period?: string;
  coverage_type?: string;
  details?: string;
}

export interface SaleInput {
  client_name: string;
  payment_method: string;
  installments: number;
  total_amount: number;
  miles_used?: number;
  miles_cost?: number;
  supplier_id?: string;
  gross_profit?: number;
  products: SaleProduct[];
}

export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          suppliers (name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleData: SaleInput) => {
      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([{
          client_name: saleData.client_name,
          payment_method: saleData.payment_method,
          installments: saleData.installments,
          total_amount: saleData.total_amount,
          miles_used: saleData.miles_used,
          miles_cost: saleData.miles_cost,
          supplier_id: saleData.supplier_id,
          gross_profit: saleData.gross_profit
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert products
      const productsWithSaleId = saleData.products.map(product => ({
        ...product,
        sale_id: sale.id
      }));

      const { error: productsError } = await supabase
        .from("sale_products")
        .insert(productsWithSaleId);

      if (productsError) throw productsError;

      // Insert financial transaction (revenue)
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([{
          date: new Date().toISOString().split('T')[0],
          description: `Venda - ${saleData.client_name}`,
          type: 'receita',
          category: 'Vendas',
          value: saleData.total_amount
        }]);

      if (transactionError) throw transactionError;

      // If miles were used, record the transaction
      if (saleData.miles_used && saleData.supplier_id) {
        const { error: milesTransactionError } = await supabase
          .from("miles_transactions")
          .insert([{
            sale_id: sale.id,
            type: 'sale',
            quantity: saleData.miles_used,
            cost_per_thousand: saleData.miles_cost ? (saleData.miles_cost / saleData.miles_used) * 1000 : 0,
            total_value: saleData.miles_cost || 0,
            description: `Venda - ${saleData.client_name} (${saleData.miles_used.toLocaleString()} milhas)`
          }]);

        if (milesTransactionError) throw milesTransactionError;
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["miles_inventory"] });
    },
  });
};