import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Sale, SaleProductDb } from "@/hooks/useSales";
import { useInstallments, usePayInstallment } from "@/hooks/useInstallments";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SaleDetailsExpandedProps {
  sale: Sale;
}

export function SaleDetailsExpanded({ sale }: SaleDetailsExpandedProps) {
  const { toast } = useToast();
  const { data: installments = [] } = useInstallments(sale.id);
  const payInstallment = usePayInstallment();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR');

  const handlePayInstallment = async (installmentId: string) => {
    try {
      await payInstallment.mutateAsync(installmentId);
      toast({
        title: "Parcela paga com sucesso!",
        description: "A parcela foi marcada como paga e a transação foi registrada.",
      });
    } catch (error) {
      toast({
        title: "Erro ao pagar parcela",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pago</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const totalPaid = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0);
  const totalPending = installments.filter(i => i.status !== 'paid').reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="space-y-6 p-4 border-t bg-muted/50">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total do Contrato</div>
            <div className="text-lg font-bold text-primary">{formatCurrency(Number(sale.total_amount))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Pago</div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Custo Base</div>
            <div className="text-lg font-bold text-orange-600">{formatCurrency(Number(sale.miles_cost || 0))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Restante</div>
            <div className="text-lg font-bold text-red-600">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Produtos da Venda - Layout Horizontal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Produtos da Venda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sale.sale_products?.map((product: SaleProductDb) => {
            const getProductTypeLabel = (type: string) => {
              const labels = {
                'passagem': 'Passagem',
                'hotel': 'Hotel',
                'veiculo': 'Veículo',
                'seguro': 'Seguro',
                'transfer': 'Transfer',
                'passeios': 'Passeios',
                'outros': 'Outros'
              };
              return labels[type] || labels['outros'];
            };

            // Static class mappings for Tailwind JIT
            const productClassMap = {
              'passagem': 'bg-product-passagem text-product-passagem-foreground border-0',
              'hotel': 'bg-product-hotel text-product-hotel-foreground border-0',
              'veiculo': 'bg-product-veiculo text-product-veiculo-foreground border-0',
              'seguro': 'bg-product-seguro text-product-seguro-foreground border-0',
              'transfer': 'bg-product-transfer text-product-transfer-foreground border-0',
              'passeios': 'bg-product-passeios text-product-passeios-foreground border-0',
              'outros': 'bg-product-outros text-product-outros-foreground border-0'
            };

            return (
              <Card key={product.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary"
                      className={productClassMap[product.type] || productClassMap['outros']}
                    >
                      {getProductTypeLabel(product.type)}
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(Number(product.price))}</div>
                      {product.quantity > 1 && (
                        <div className="text-sm text-muted-foreground">Qtd: {product.quantity}</div>
                      )}
                    </div>
                  </div>

                  {/* Fornecedor - destacado quando disponível */}
                  {product.fornecedor && (
                    <div className="text-sm font-medium text-primary">
                      📋 {product.fornecedor}
                    </div>
                  )}

                  {product.details && (
                    <div className="text-sm text-muted-foreground">{product.details}</div>
                  )}

                  {product.origin && product.destination && (
                    <div className="text-sm font-medium">
                      {product.origin} → {product.destination}
                    </div>
                  )}

                  {/* Período/Datas quando disponível */}
                  {product.departure_date && (
                    <div className="text-sm text-muted-foreground">
                      <div>Partida: {formatDate(product.departure_date)}</div>
                      {product.return_date && (
                        <div>Retorno: {formatDate(product.return_date)}</div>
                      )}
                    </div>
                  )}

                  {/* Datas específicas por tipo de produto */}
                  {product.checkin && product.checkout && (
                    <div className="text-sm text-muted-foreground">
                      <div>Check-in: {formatDate(product.checkin)}</div>
                      <div>Check-out: {formatDate(product.checkout)}</div>
                    </div>
                  )}

                  {product.dataPasseio && (
                    <div className="text-sm text-muted-foreground">
                      <div>Data: {formatDate(product.dataPasseio)}</div>
                      {product.duracao && <div>Duração: {product.duracao}</div>}
                    </div>
                  )}

                  {product.periodo && (
                    <div className="text-sm text-muted-foreground">
                      Período: {product.periodo}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Controle de Parcelas - Layout Vertical */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Controle de Parcelas</h3>
        <Card>
          <CardContent>
            <div className="space-y-3">
              {installments.map((installment) => (
                <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(installment.status)}
                    <div>
                      <div className="font-medium">Parcela {installment.installment_number}</div>
                      <div className="text-sm text-muted-foreground">
                        Venc: {formatDate(installment.due_date)}
                        {installment.paid_date && (
                          <span className="ml-2">• Pago: {formatDate(installment.paid_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(Number(installment.amount))}</div>
                      {getStatusBadge(installment.status)}
                    </div>
                    {installment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handlePayInstallment(installment.id)}
                        disabled={payInstallment.isPending}
                      >
                        Pagar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}