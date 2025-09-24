import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SaleProduct, generateProductName } from "@/components/vendas/DynamicProductForm";
import { DateRange } from "@/components/shared/useDateRangeFilter";

// Re-export SaleProduct for convenience
export type { SaleProduct };

export interface SaleProductDb {
  id: string;
  sale_id: string;
  type: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
  details?: string;
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
  created_at: string;
}

export interface Sale {
  id: string;
  client_name: string;
  payment_method: string;
  installments: number;
  total_amount: number;
  sale_date?: string;
  miles_used?: number;
  miles_cost?: number;
  supplier_id?: string;
  gross_profit?: number;
  created_at: string;
  updated_at: string;
  suppliers?: { name: string };
  sale_products?: SaleProductDb[];
}

export interface SaleInput {
  client_name: string;
  payment_method: string;
  installments: number;
  total_amount: number;
  sale_date?: string;
  miles_used?: number;
  miles_cost?: number;
  supplier_id?: string;
  gross_profit?: number;
  has_anticipation?: boolean;
  anticipation_date?: string;
  products: SaleProduct[];
}

export const useSales = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["sales", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select(`
          *,
          suppliers (name),
          sale_products (*)
        `);

      // Apply date filter if dateRange is provided
      if (dateRange?.from) {
        query = query.gte("created_at", dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        query = query.lte("created_at", dateRange.to.toISOString().split('T')[0]);
      }

      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
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
          sale_date: saleData.sale_date,
          miles_used: saleData.miles_used,
          miles_cost: saleData.miles_cost,
          supplier_id: saleData.supplier_id,
          gross_profit: saleData.gross_profit,
          has_anticipation: saleData.has_anticipation,
          anticipation_date: saleData.anticipation_date
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert products - map the form fields to database fields
      const productsForDb = saleData.products.map(product => {
        // Garantir que sempre temos um nome válido
        const productName = product.name || generateProductName(product) || `${product.type || 'Produto'}`;
        
        return {
          sale_id: sale.id,
          type: product.type || 'outros',
          name: productName,
          quantity: product.quantity,
          price: product.price,
          cost: product.cost || 0,
          details: product.details || '',
          // Map form fields to database fields
          airline: product.airline,
          passengers: product.adults && product.children ? `${product.adults} adultos, ${product.children} crianças` : '',
          origin: product.origin,
          destination: product.destination,
          // Convert empty strings to null for date fields
          departure_date: product.trecho1 || null,
          return_date: product.trecho2 || null,
          miles: product.qtdMilhas,
          miles_cost: product.custoMil,
          checkin_date: product.checkin || null,
          checkout_date: product.checkout || null,
          vehicle_category: product.categoria,
          rental_period: product.periodo,
          coverage_type: product.cobertura
        };
      });

      const { error: productsError } = await supabase
        .from("sale_products")
        .insert(productsForDb);

      if (productsError) throw productsError;

      // Insert sale installments with duplicate prevention
      if (saleData.installments >= 1) {
        // Double-check no installments exist (race condition prevention)
        const { count } = await supabase
          .from("sale_installments")
          .select("*", { count: 'exact', head: true })
          .eq("sale_id", sale.id);
          
        if (count === 0) {
          const baseDate = saleData.sale_date ? new Date(saleData.sale_date) : new Date();
          const installmentAmount = saleData.total_amount / saleData.installments;
          
          const installmentsToInsert = Array.from({ length: saleData.installments }, (_, index) => {
            const dueDate = new Date(baseDate);
            dueDate.setMonth(dueDate.getMonth() + index);
            
            return {
              sale_id: sale.id,
              installment_number: index + 1,
              due_date: dueDate.toISOString().split('T')[0],
              amount: installmentAmount,
              status: 'pending'
            };
          });

          const { error: installmentsError } = await supabase
            .from("sale_installments")
            .insert(installmentsToInsert);

          if (installmentsError) throw installmentsError;
        }
      }

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
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<SaleInput>) => {
      const { data, error } = await supabase
        .from("sales")
        .update({
          client_name: updates.client_name,
          payment_method: updates.payment_method,
          installments: updates.installments,
          total_amount: updates.total_amount,
          sale_date: updates.sale_date,
          miles_used: updates.miles_used,
          miles_cost: updates.miles_cost,
          supplier_id: updates.supplier_id,
          gross_profit: updates.gross_profit
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleId: string) => {
      // Delete sale (cascade will handle sale_products and sale_installments)
      const { error } = await supabase
        .from("sales")
        .delete()
        .eq("id", saleId);

      if (error) throw error;
      return saleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};