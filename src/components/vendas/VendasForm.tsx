
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DynamicProductForm, { EmptyProduct, generateProductName } from "@/components/vendas/DynamicProductForm";
import SaleSummary from "@/components/sales/SaleSummary";
import { PAYMENT_METHODS } from '@/data/products';
import { useCreateSale, SaleProduct } from '@/hooks/useSales';
import ClientSelector from './ClientSelector';
import { Client } from '@/hooks/useClients';

interface VendasFormProps {
  onSaleSuccess?: () => void;
}

const VendasForm = ({ onSaleSuccess }: VendasFormProps = {}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState<SaleProduct[]>([EmptyProduct]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [installments, setInstallments] = useState(1);
  const [hasAnticipation, setHasAnticipation] = useState(false);
  const [anticipationDate, setAnticipationDate] = useState('');
  const { toast } = useToast();
  const createSale = useCreateSale();

  const addProduct = () => setProducts([...products, EmptyProduct]);
  const removeProduct = (idx: number) => setProducts(products.filter((_, i) => i !== idx));
  const updateProduct = (idx: number, product: SaleProduct) => setProducts(products.map((p, i) => i === idx ? product : p));

  // Cálculo dos totais em tempo real otimizado
  const total = React.useMemo(() => {
    return products.reduce((sum, p) => {
      const productTotal = (p.price || 0) * (p.quantity || 1);
      return sum + productTotal;
    }, 0);
  }, [products]);

  const totalCost = React.useMemo(() => {
    return products.reduce((sum, p) => {
      if (p.type === "passagem" && p.ticketType === "milhas") {
        // Para passagem com milhas, usar qtdMilhas * custoMil / 1000 + taxas
        const milhas = Number(p.qtdMilhas || 0);
        const custoMil = Number(p.custoMil || 0);
        const taxas = Number(p.taxValue || 0);
        const custoTotal = (milhas / 1000) * custoMil + taxas;
        return sum + custoTotal;
      }
      // Para outros produtos e passagem tarifada, usar campo cost
      const custo = p.cost || 0;
      return sum + custo;
    }, 0);
  }, [products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione um cliente" });
      return;
    }
    if (!paymentMethod) {
      toast({ variant: "destructive", title: "Erro", description: "Escolha o método de pagamento" });
      return;
    }
    if (!products.length || products.every(p => !p.type)) {
      toast({ variant: "destructive", title: "Erro", description: "Adicione ao menos um produto." });
      return;
    }

    // Validar se todos os produtos têm campos obrigatórios preenchidos
    const invalidProducts = products.filter(p => {
      if (!p.type) return true;
      if (!p.name && !generateProductName(p)) return true;
      if (p.price <= 0) return true;
      return false;
    });

    if (invalidProducts.length > 0) {
      toast({ 
        variant: "destructive", 
        title: "Erro de validação", 
        description: "Verifique se todos os produtos têm tipo e preço válidos." 
      });
      return;
    }


    createSale.mutate({
      client_name: selectedClient.name,
      client_id: selectedClient.id,
      sale_date: saleDate,
      products,
      payment_method: paymentMethod,
      installments,
      total_amount: total,
      has_anticipation: hasAnticipation,
      anticipation_date: anticipationDate || undefined,
    }, {
      onSuccess: () => {
        toast({ title: "Venda registrada com sucesso!", description: `Total: R$ ${total.toFixed(2)}` });
        setSelectedClient(null);
        setSaleDate(new Date().toISOString().split('T')[0]);
        setProducts([EmptyProduct]);
        setPaymentMethod('');
        setInstallments(1);
        setHasAnticipation(false);
        setAnticipationDate('');
        onSaleSuccess?.();
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Erro ao salvar", description: err.message });
      }
    });
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ClientSelector
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
              />
            </div>
            <div>
              <Label htmlFor="saleDate">Data da Venda</Label>
              <Input 
                id="saleDate" 
                type="date"
                value={saleDate} 
                onChange={e => setSaleDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">Produtos / Serviços</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              {products.map((product, idx) => (
                <DynamicProductForm
                  key={idx}
                  value={product}
                  onChange={prod => updateProduct(idx, prod)}
                  onRemove={products.length > 1 ? () => removeProduct(idx) : undefined}
                />
              ))}
              <Button type="button" variant="default" onClick={addProduct} className="w-full">
                Adicionar Produto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          
          {paymentMethod === "Cartão de Crédito" && (
            <div className="mt-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="anticipation"
                  checked={hasAnticipation}
                  onChange={e => setHasAnticipation(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="anticipation" className="text-sm">
                  Antecipação (receber valor total em 1x)
                </Label>
              </div>
              {hasAnticipation && (
                <div>
                  <Label htmlFor="anticipationDate">Data da Antecipação</Label>
                  <Input
                    id="anticipationDate"
                    type="date"
                    value={anticipationDate}
                    onChange={e => setAnticipationDate(e.target.value)}
                    className="mt-1"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SaleSummary total={total} totalCost={totalCost} />
      
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
