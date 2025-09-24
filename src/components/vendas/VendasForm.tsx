
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DynamicProductForm, { EmptyProduct } from "@/components/vendas/DynamicProductForm";
import SaleSummary from "@/components/sales/SaleSummary";
import { PAYMENT_METHODS } from '@/data/products';
import { useCreateSale, SaleProduct } from '@/hooks/useSales';

const VendasForm = () => {
  const [client, setClient] = useState('');
  const [products, setProducts] = useState<SaleProduct[]>([EmptyProduct]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [installments, setInstallments] = useState(1);
  const { toast } = useToast();
  const createSale = useCreateSale();

  const addProduct = () => setProducts([...products, EmptyProduct]);
  const removeProduct = (idx: number) => setProducts(products.filter((_, i) => i !== idx));
  const updateProduct = (idx: number, product: SaleProduct) => setProducts(products.map((p, i) => i === idx ? product : p));

  const total = products.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) {
      toast({ variant: "destructive", title: "Erro", description: "Informe o nome do cliente" });
      return;
    }
    if (!paymentMethod) {
      toast({ variant: "destructive", title: "Erro", description: "Escolha o método de pagamento" });
      return;
    }
    if (!products.length || products.every(p => !p.name)) {
      toast({ variant: "destructive", title: "Erro", description: "Adicione ao menos um produto." });
      return;
    }

    createSale.mutate({
      client_name: client,
      products,
      payment_method: paymentMethod,
      installments,
      total_amount: total,
    }, {
      onSuccess: () => {
        toast({ title: "Venda registrada no banco com sucesso!", description: `Total: R$ ${total.toFixed(2)}` });
        setClient('');
        setProducts([EmptyProduct]);
        setPaymentMethod('');
        setInstallments(1);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Erro ao salvar no banco", description: err.message });
      }
    });
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Label htmlFor="client">Nome do Cliente</Label>
          <Input 
            id="client" 
            value={client} 
            onChange={e => setClient(e.target.value)} 
            placeholder="Digite o nome do cliente"
            className="mt-1"
          />
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary">Produtos / Serviços</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {products.map((product, idx) => (
                <DynamicProductForm
                  key={idx}
                  value={product}
                  onChange={prod => updateProduct(idx, prod)}
                  onRemove={products.length > 1 ? () => removeProduct(idx) : undefined}
                />
              ))}
              <Button type="button" variant="outline" onClick={addProduct} className="w-full">
                Adicionar Produto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary">Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment">Método de Pagamento</Label>
              <select
                className="w-full mt-1 border border-input rounded-md h-10 px-3 bg-background"
                id="payment"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                {PAYMENT_METHODS.map(pm =>
                  <option key={pm.id} value={pm.name}>{pm.name}</option>
                )}
              </select>
            </div>
            {(paymentMethod === "Cartão de Crédito" || paymentMethod === "Boleto Bancário") && (
              <div>
                <Label htmlFor="inst">Parcelas</Label>
                <Input 
                  id="inst" 
                  type="number" 
                  min={1} 
                  max={12} 
                  value={installments} 
                  onChange={e => setInstallments(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SaleSummary total={total} />
      
      <Button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-primary/90"
        disabled={createSale.isPending}
      >
        {createSale.isPending ? "Salvando..." : "Registrar Venda"}
      </Button>
    </div>
  );
};

export default VendasForm;
