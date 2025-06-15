import React, { useState } from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DynamicProductForm, { EmptyProduct, ProductType, SaleProduct } from "@/components/vendas/DynamicProductForm";
import SaleSummary from "@/components/sales/SaleSummary";
import { PAYMENT_METHODS } from '@/data/products';
import { useCreateSale } from '@/hooks/useCreateSale';

const Vendas = () => {
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
      client,
      products,
      paymentMethod,
      installments,
      total,
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
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Vendas</h2>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="client">Nome do Cliente</Label>
            <Input id="client" value={client} onChange={e => setClient(e.target.value)} placeholder="Digite o nome do cliente" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Produtos / Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product, idx) => (
                <DynamicProductForm
                  key={idx}
                  value={product}
                  onChange={prod => updateProduct(idx, prod)}
                  onRemove={products.length > 1 ? () => removeProduct(idx) : undefined}
                />
              ))}
              <Button type="button" variant="secondary" onClick={addProduct}>Adicionar Produto</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment">Método de Pagamento</Label>
              <select
                className="w-full mt-1 border rounded-md h-10"
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
            <div>
              <Label htmlFor="inst">Parcelas</Label>
              <Input id="inst" type="number" min={1} value={installments} onChange={e => setInstallments(Number(e.target.value))} />
            </div>
          </CardContent>
        </Card>
        <SaleSummary total={total} />
        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={createSale.isPending}
        >
          {createSale.isPending ? "Salvando..." : "Registrar Venda"}
        </Button>
      </form>
    </DashboardLayout>
  );
};

export default Vendas;
