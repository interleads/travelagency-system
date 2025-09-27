import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, User, MapPin, Calendar, DollarSign, Plane, Building, CreditCard } from "lucide-react";
import { Sale } from "@/hooks/useSales";
import { useInstallments, usePayInstallment } from "@/hooks/useInstallments";
import { useToast } from "@/hooks/use-toast";

interface MobileSaleDetailsModalProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSaleDetailsModal({ sale, open, onOpenChange }: MobileSaleDetailsModalProps) {
  const { toast } = useToast();
  const { data: installments = [] } = useInstallments(sale?.id);
  const payInstallment = usePayInstallment();

  if (!sale) return null;

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

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'passagem':
        return <Plane className="w-4 h-4 text-blue-500" />;
      case 'hospedagem':
        return <Building className="w-4 h-4 text-green-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            Detalhes da Venda
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cliente:</span>
              <span className="font-medium">{sale.client_name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Data da venda:</span>
              <span className="font-medium">{formatDate(sale.created_at)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Valor total:</span>
              <span className="font-bold text-primary text-lg">{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>

          {/* Produtos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Plane size={16} />
              Produtos ({sale.sale_products?.length || 0})
            </h3>
            
            <div className="space-y-3">
              {sale.sale_products?.map((product: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 bg-muted/20">
                  <div className="flex items-start gap-2 mb-2">
                    {getProductIcon(product.type)}
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs mb-1 capitalize">
                        {product.type}
                      </Badge>
                      <p className="text-sm font-medium text-foreground break-words">
                        {product.origin && product.destination ? 
                          `${product.origin} → ${product.destination}` : 
                          product.details || 'Produto'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                    {product.departure_date && (
                      <div>
                        <span className="text-muted-foreground">Partida:</span>
                        <p className="font-medium">{formatDate(product.departure_date)}</p>
                      </div>
                    )}
                    {product.return_date && (
                      <div>
                        <span className="text-muted-foreground">Retorno:</span>
                        <p className="font-medium">{formatDate(product.return_date)}</p>
                      </div>
                    )}
                    {product.airline && (
                      <div>
                        <span className="text-muted-foreground">Cia. Aérea:</span>
                        <p className="font-medium">{product.airline}</p>
                      </div>
                    )}
                    {product.passengers && (
                      <div>
                        <span className="text-muted-foreground">Passageiros:</span>
                        <p className="font-medium">{product.passengers}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Valor:</span>
                    <span className="font-bold text-sm">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parcelas */}
          {installments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <CreditCard size={16} />
                Parcelas ({installments.length})
              </h3>
              
              <div className="space-y-2">
                {installments.map((installment, index) => (
                  <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(installment.status)}
                      <div>
                        <p className="text-sm font-medium">
                          Parcela {index + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Venc: {formatDate(installment.due_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        {formatCurrency(installment.amount)}
                      </p>
                      {installment.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs mt-1"
                          onClick={() => handlePayInstallment(installment.id)}
                        >
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}