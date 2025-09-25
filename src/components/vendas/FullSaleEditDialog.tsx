import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DynamicProductForm, { EmptyProduct } from "@/components/vendas/DynamicProductForm";
import SaleSummary from "@/components/sales/SaleSummary";
import { PAYMENT_METHODS } from '@/data/products';
import { SaleProduct, ProductType } from "@/components/vendas/DynamicProductForm";
import { Sale, useUpdateSale } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';

interface FullSaleEditDialogProps {
  sale: Sale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FullSaleEditDialog({ sale, open, onOpenChange }: FullSaleEditDialogProps) {
  const [client, setClient] = useState(sale.client_name);
  const [saleDate, setSaleDate] = useState(
    sale.sale_date ? new Date(sale.sale_date).toISOString().split('T')[0] : 
    new Date(sale.created_at).toISOString().split('T')[0]
  );
  const [products, setProducts] = useState<SaleProduct[]>(
    sale.sale_products && sale.sale_products.length > 0 
          ? sale.sale_products.map(p => ({
              name: p.name,
              type: p.type as ProductType,
              price: Number(p.price),
              cost: Number(p.cost || 0),
              quantity: p.quantity,
              // Map database fields back to form fields
              trecho1: p.departure_date || '',
              trecho2: p.return_date || '',
              adults: 0,
              children: 0,
              airline: p.airline || '',
              qtdMilhas: p.miles || 0,
              custoMil: Number(p.miles_cost || 0),
              checkin: p.checkin_date || '',
              checkout: p.checkout_date || '',
              categoria: p.vehicle_category || '',
              periodo: p.rental_period || '',
              cobertura: p.coverage_type || '',
              details: p.details || '',
              fornecedor: p.fornecedor || '' // Incluir campo fornecedor
            }))
      : [EmptyProduct]
  );
  const [paymentMethod, setPaymentMethod] = useState(sale.payment_method);
  const [installments, setInstallments] = useState(sale.installments || 1);
  
  const { toast } = useToast();
  const updateSale = useUpdateSale();

  // Reset form when sale changes
  useEffect(() => {
    if (sale) {
      setClient(sale.client_name);
      setSaleDate(
        sale.sale_date ? new Date(sale.sale_date).toISOString().split('T')[0] : 
        new Date(sale.created_at).toISOString().split('T')[0]
      );
      setProducts(
        sale.sale_products && sale.sale_products.length > 0 
          ? sale.sale_products.map(p => ({
              name: p.name,
              type: p.type as ProductType,
              price: Number(p.price),
              cost: Number(p.cost || 0),
              quantity: p.quantity,
              // Map database fields back to form fields
              trecho1: p.departure_date || '',
              trecho2: p.return_date || '',
              adults: 0,
              children: 0,
              airline: p.airline || '',
              qtdMilhas: p.miles || 0,
              custoMil: Number(p.miles_cost || 0),
              checkin: p.checkin_date || '',
              checkout: p.checkout_date || '',
              categoria: p.vehicle_category || '',
              periodo: p.rental_period || '',
              cobertura: p.coverage_type || '',
              details: p.details || '',
              fornecedor: p.fornecedor || '' // Incluir campo fornecedor
            }))
          : [EmptyProduct]
      );
      setPaymentMethod(sale.payment_method);
      setInstallments(sale.installments || 1);
    }
  }, [sale]);

  const addProduct = () => setProducts([...products, EmptyProduct]);
  const removeProduct = (idx: number) => setProducts(products.filter((_, i) => i !== idx));
  const updateProduct = (idx: number, product: SaleProduct) => setProducts(products.map((p, i) => i === idx ? product : p));

  // Cálculo dos totais em tempo real com debugging  
  const total = React.useMemo(() => {
    return products.reduce((sum, p) => {
      const productTotal = (p.price || 0) * (p.quantity || 1);
      console.log('Cálculo total produto (edit):', { name: p.name, price: p.price, quantity: p.quantity, total: productTotal });
      return sum + productTotal;
    }, 0);
  }, [products]);

  const totalCost = React.useMemo(() => {
    return products.reduce((sum, p) => {
      if (p.type === "passagem" && p.ticketType === "milhas") {
        const milhas = Number(p.qtdMilhas || 0);
        const custoMil = Number(p.custoMil || 0);
        const custoTotal = (milhas / 1000) * custoMil;
        console.log('Cálculo custo milhas (edit):', { name: p.name, milhas, custoMil, custoTotal });
        return sum + custoTotal;
      }
      const custo = p.cost || 0;
      console.log('Cálculo custo padrão (edit):', { name: p.name, custo });
      return sum + custo;
    }, 0);
  }, [products]);

  console.log('Totais calculados FullSaleEditDialog:', { total, totalCost, profit: total - totalCost });

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

    try {
      await updateSale.mutateAsync({
        id: sale.id,
        client_name: client,
        sale_date: saleDate,
        payment_method: paymentMethod,
        installments,
        total_amount: total,
        products: products // Incluir produtos na atualização
      });
      
      toast({
        title: "Venda atualizada com sucesso!",
        description: `Total: R$ ${total.toFixed(2)}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar venda",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-primary">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Nome do Cliente</Label>
                  <Input 
                    id="client" 
                    value={client} 
                    onChange={e => setClient(e.target.value)} 
                    placeholder="Digite o nome do cliente"
                    className="mt-1"
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
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-primary">Produtos / Serviços</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
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

          <SaleSummary total={total} totalCost={totalCost} />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={updateSale.isPending}
            >
              {updateSale.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}