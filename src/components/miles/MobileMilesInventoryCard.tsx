import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MilesInventoryActions } from './MilesInventoryActions';

interface MobileMilesInventoryCardProps {
  item: any;
}

export function MobileMilesInventoryCard({ item }: MobileMilesInventoryCardProps) {
  const getStatusColor = (status: string, remainingQuantity: number) => {
    if (status === 'Esgotado' || remainingQuantity === 0) return "destructive";
    if (remainingQuantity < 10000) return "secondary";
    return "default";
  };

  const getStatusText = (status: string, remainingQuantity: number) => {
    if (status === 'Esgotado' || remainingQuantity === 0) return "Esgotado";
    if (remainingQuantity < 10000) return "Estoque Baixo";
    return "Ativo";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {item.miles_programs?.name || 'N/A'}
          </CardTitle>
          <Badge variant={getStatusColor(item.status, item.remaining_quantity)} className="text-xs">
            {getStatusText(item.status, item.remaining_quantity)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Fornecedor</p>
            <p className="font-semibold">{item.suppliers?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Saldo</p>
            <p className="font-semibold text-primary">{item.remaining_quantity.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Qtd Original</p>
            <p>{item.quantity.toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Custo/Mil</p>
            <p>R$ {item.cost_per_thousand.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Valor Investido</p>
            <p className="font-semibold">R$ {item.purchase_value.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Data Compra</p>
            <p>{new Date(item.purchase_date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <div className="flex justify-end pt-2 border-t">
          <MilesInventoryActions item={item} />
        </div>
      </CardContent>
    </Card>
  );
}