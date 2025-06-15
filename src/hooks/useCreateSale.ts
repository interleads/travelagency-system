import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { SaleProduct } from "@/components/vendas/DynamicProductForm";

type SaleInput = {
  client: string;
  paymentMethod: string;
  installments: number;
  total: number;
  products: SaleProduct[];
};

export function useCreateSale() {
  return useMutation({
    mutationFn: async (sale: SaleInput) => {
      // 1. Obter usuário logado
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) throw new Error("Usuário não autenticado.");
      const user_id = userData.user.id;

      // 2. Inserir venda (ignorando typing de Supabase client)
      const { data: saleRows, error: saleErr } = await (supabase as any)
        .from("sales")
        .insert([{
          user_id,
          client_name: sale.client,
          payment_method: sale.paymentMethod,
          installments: sale.installments,
          total: sale.total,
        }])
        .select()
        .single();

      if (saleErr || !saleRows) throw new Error("Erro ao registrar venda: " + (saleErr?.message || ""));

      // 3. Inserir produtos da venda
      const productRows = sale.products.filter(p => !!p.name);
      if (productRows.length) {
        const saleProducts = productRows.map(prod => ({
          sale_id: saleRows.id,
          type: prod.type ?? null,
          name: prod.name,
          quantity: prod.quantity,
          price: prod.price,
          details: prod.details || null,
          extra_fields: JSON.stringify(
            Object.fromEntries(
              Object.entries(prod).filter(([k]) => !['type','name','quantity','price','details'].includes(k))
            )
          ) || null,
        }));
        const { error: prodErr } = await (supabase as any)
          .from("sale_products")
          .insert(saleProducts);
        if (prodErr) throw new Error("Erro ao salvar produtos: " + prodErr.message);
      }

      return saleRows;
    }
  });
}
