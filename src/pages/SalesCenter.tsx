
import React, { useState } from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SaleProductForm, { SaleProductFormValues } from "@/components/sales/SaleProductForm";
import SaleSummary from "@/components/sales/SaleSummary";

const initialProduct: SaleProductFormValues = {
  type: "",
  name: "",
  quantity: 1,
  details: "",
  price: 0
};

export default function SalesCenter() {
  const [client, setClient] = useState('');
  const [products, setProducts] = useState<SaleProductFormValues[]>([initialProduct]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [installments, setInstallments] = useState(1);

  const addProduct = () => setProducts([...products, initialProduct]);
  const removeProduct = (idx: number) => setProducts(products.filter((_, i) => i !== idx));
  const updateProduct = (idx: number, product: SaleProductFormValues) => setProducts(products.map((p, i) => i === idx ? product : p));

  const total = products.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode implementar a lógica de integração financeira (contas a receber, fluxo de caixa, etc)
    alert("Venda registrada com sucesso.");
    setClient('');
    setProducts([initialProduct]);
    setPaymentMethod('');
    setInstallments(1);
  };

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Central de Vendas</h2>
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
                <SaleProductForm
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
              <Input id="payment" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="Ex: Cartão, PIX..." />
            </div>
            <div>
              <Label htmlFor="inst">Parcelas</Label>
              <Input id="inst" type="number" min={1} value={installments} onChange={e => setInstallments(Number(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        <SaleSummary total={total} />

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
          Registrar Venda
        </Button>
      </form>
    </DashboardLayout>
  );
}
