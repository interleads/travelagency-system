import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Sale, SaleProductDb } from "@/hooks/useSales";
import { useInstallments, usePayInstallment } from "@/hooks/useInstallments";
import { useToast } from "@/hooks/use-toast";

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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos da Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sale.sale_products?.map((product: SaleProductDb) => (
                <div key={product.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <Badge variant="outline" className="text-xs">{product.type}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(Number(product.price))}</div>
                      <div className="text-sm text-muted-foreground">Qtd: {product.quantity}</div>
                    </div>
                  </div>
                  {product.details && (
                    <div className="text-sm text-muted-foreground">{product.details}</div>
                  )}
                  {product.origin && product.destination && (
                    <div className="text-sm text-muted-foreground">
                      {product.origin} → {product.destination}
                    </div>
                  )}
                  {product.departure_date && (
                    <div className="text-sm text-muted-foreground">
                      Partida: {formatDate(product.departure_date)}
                      {product.return_date && ` • Retorno: ${formatDate(product.return_date)}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controle de Parcelas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Controle de Parcelas</CardTitle>
          </CardHeader>
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