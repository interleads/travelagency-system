
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
    <form onSubmit={handleSubmit} className="space-y-2 max-w-3xl mx-auto">
      <Card className="mb-2">
        <CardHeader className="pb-2">
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          <Label htmlFor="client">Nome do Cliente</Label>
          <Input id="client" value={client} onChange={e => setClient(e.target.value)} placeholder="Digite o nome do cliente" />
        </CardContent>
      </Card>
      <Card className="mb-2">
        <CardHeader className="pb-2">
          <CardTitle>Produtos / Serviços</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-2">
          <div className="space-y-2">
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
      <Card className="mb-2">
        <CardHeader className="pb-2">
          <CardTitle>Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 pb-2">
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
        className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2"
        disabled={createSale.isPending}
      >
        {createSale.isPending ? "Salvando..." : "Registrar Venda"}
      </Button>
    </form>
  );
};

export default VendasForm;
