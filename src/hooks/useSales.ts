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
  fornecedor?: string; // Campo fornecedor para todos os produtos
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
  checkin?: string; // Alias para checkin_date
  checkout?: string; // Alias para checkout_date
  vehicle_category?: string;
  rental_period?: string;
  periodo?: string; // Alias para rental_period
  coverage_type?: string;
  dataPasseio?: string; // Data do passeio
  duracao?: string; // Duração do passeio/serviço
  locator?: string; // Campo localizador
  tax_value?: number; // Valor das taxas
  card_taxes?: string; // Informações do cartão das taxas
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

      // Process miles consumption for own miles products
      for (const product of saleData.products) {
        if (product.type === "passagem" && product.ticketType === "milhas" && product.useOwnMiles && product.qtdMilhas) {
          // Find miles inventory using FIFO (first in, first out)
          const { data: inventory, error: inventoryError } = await supabase
            .from("miles_inventory")
            .select("*, miles_programs(name)")
            .eq("program_id", product.milesProgram || "")
            .gt("remaining_quantity", 0)
            .eq("status", "Ativo")
            .order("purchase_date", { ascending: true });

          if (inventoryError) throw inventoryError;

          let remainingMiles = product.qtdMilhas;
          let totalCost = 0;

          for (const lot of inventory || []) {
            if (remainingMiles <= 0) break;

            const milesToConsume = Math.min(remainingMiles, lot.remaining_quantity);
            const lotCostPerThousand = lot.cost_per_thousand;
            const consumptionCost = (milesToConsume / 1000) * lotCostPerThousand;

            // Update inventory
            await supabase
              .from("miles_inventory")
              .update({ 
                remaining_quantity: lot.remaining_quantity - milesToConsume,
                updated_at: new Date().toISOString()
              })
              .eq("id", lot.id);

            // Record miles transaction
            await supabase
              .from("miles_transactions")
              .insert({
                sale_id: sale.id,
                miles_inventory_id: lot.id,
                type: "sale",
                quantity: milesToConsume,
                cost_per_thousand: lotCostPerThousand,
                total_value: consumptionCost,
                description: `Venda ${saleData.client_name} - ${milesToConsume.toLocaleString()} milhas`
              });

            totalCost += consumptionCost;
            remainingMiles -= milesToConsume;

            // Update lot status if depleted
            if (lot.remaining_quantity - milesToConsume <= 0) {
              await supabase
                .from("miles_inventory")
                .update({ status: "Esgotado" })
                .eq("id", lot.id);
            }
          }

          // Update product cost with calculated FIFO cost
          product.cost = totalCost;
        }
      }

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
          fornecedor: product.fornecedor || '', // Campo fornecedor
          supplier_id: product.supplier_id || null, // New supplier relationship
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
          coverage_type: product.cobertura,
          locator: product.locator || null,
          tax_value: product.taxValue || null,
          card_taxes: product.cardTaxes || null
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
      // More specific invalidation to reduce unnecessary re-fetches
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, products, ...updates }: { id: string; products?: SaleProduct[] } & Partial<SaleInput>) => {
      // First, revert any previous miles transactions for this sale to prevent double deductions
      const { data: previousMilesTransactions } = await supabase
        .from("miles_transactions")
        .select("*")
        .eq("sale_id", id)
        .eq("type", "sale");

      if (previousMilesTransactions && previousMilesTransactions.length > 0) {
        // Revert the miles back to inventory
        for (const transaction of previousMilesTransactions) {
          if (transaction.miles_inventory_id) {
            // Get current inventory data
            const { data: currentInventory } = await supabase
              .from("miles_inventory")
              .select("remaining_quantity")
              .eq("id", transaction.miles_inventory_id)
              .single();

            if (currentInventory) {
              await supabase
                .from("miles_inventory")
                .update({
                  remaining_quantity: currentInventory.remaining_quantity + transaction.quantity,
                  status: 'Ativo'
                })
                .eq("id", transaction.miles_inventory_id);
            }
          }
        }

        // Delete the previous miles transactions
        await supabase
          .from("miles_transactions")
          .delete()
          .eq("sale_id", id)
          .eq("type", "sale");
      }

      // Update sale data
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

      // Update products if provided
      if (products && products.length > 0) {
        // First, delete existing products
        const { error: deleteError } = await supabase
          .from("sale_products")
          .delete()
          .eq("sale_id", id);

        if (deleteError) throw deleteError;

        // Then insert updated products and handle miles transactions
        const productsForDb = products.map(product => {
          const productName = product.name || generateProductName(product) || `${product.type || 'Produto'}`;
          
          return {
            sale_id: id,
            type: product.type || 'outros',
            name: productName,
            quantity: product.quantity,
            price: product.price,
            cost: product.cost || 0,
            details: product.details || '',
            fornecedor: product.fornecedor || '', // Campo fornecedor
            supplier_id: product.supplier_id || null, // New supplier relationship
            airline: product.airline,
            passengers: product.adults && product.children ? `${product.adults} adultos, ${product.children} crianças` : '',
            origin: product.origin,
            destination: product.destination,
            departure_date: product.trecho1 || null,
            return_date: product.trecho2 || null,
            miles: product.qtdMilhas,
            miles_cost: product.custoMil,
            checkin_date: product.checkin || null,
            checkout_date: product.checkout || null,
            vehicle_category: product.categoria,
            rental_period: product.periodo,
            coverage_type: product.cobertura,
            locator: product.locator || null,
            tax_value: product.taxValue || null,
            card_taxes: product.cardTaxes || null
          };
        });

        const { error: productsError } = await supabase
          .from("sale_products")
          .insert(productsForDb);

        if (productsError) throw productsError;

        // Handle new miles transactions for products that use miles
        for (const product of products) {
          if (product.useOwnMiles && product.qtdMilhas && product.qtdMilhas > 0) {
            if (product.milesSourceType === "estoque" && product.milesProgram) {
              // Use existing inventory (FIFO approach)
              const { data: availableInventory } = await supabase
                .from("miles_inventory")
                .select("*")
                .eq("program_id", product.milesProgram)
                .eq("status", "Ativo")
                .gt("remaining_quantity", 0)
                .order("purchase_date", { ascending: true });

              if (availableInventory) {
                let remainingMiles = product.qtdMilhas;
                
                for (const inventory of availableInventory) {
                  if (remainingMiles <= 0) break;
                  
                  const milesToUse = Math.min(remainingMiles, inventory.remaining_quantity);
                  
                  // Update inventory
                  await supabase
                    .from("miles_inventory")
                    .update({
                      remaining_quantity: inventory.remaining_quantity - milesToUse,
                      status: inventory.remaining_quantity - milesToUse <= 0 ? 'Esgotado' : 'Ativo'
                    })
                    .eq("id", inventory.id);

                  // Create miles transaction
                  await supabase
                    .from("miles_transactions")
                    .insert({
                      miles_inventory_id: inventory.id,
                      sale_id: id,
                      type: 'sale',
                      quantity: milesToUse,
                      cost_per_thousand: inventory.cost_per_thousand,
                      total_value: (milesToUse / 1000) * inventory.cost_per_thousand,
                      description: `Venda - ${product.name}`
                    });

                  remainingMiles -= milesToUse;
                }
              }
            }
          }
        }
      }

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