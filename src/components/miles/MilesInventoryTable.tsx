import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMilesInventory } from '@/hooks/useMilesInventory';
import { useDateRangeFilter } from "@/components/shared/useDateRangeFilter";
import { MilesInventoryActions } from './MilesInventoryActions';
import { MobileMilesInventoryCard } from './MobileMilesInventoryCard';
import { useIsMobile } from "@/hooks/use-mobile";

export const MilesInventoryTable = () => {
  const { dateRange } = useDateRangeFilter();
  const { data: inventory = [], isLoading } = useMilesInventory(dateRange);
  const isMobile = useIsMobile();

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

  if (isLoading) {
    return <div className="text-center py-8">Carregando estoque...</div>;
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {inventory.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                Nenhum estoque de milhas encontrado
              </div>
            </CardContent>
          </Card>
        ) : (
          inventory.map((item) => (
            <MobileMilesInventoryCard key={item.id} item={item} />
          ))
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programa</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Qtd Original</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Custo/Mil</TableHead>
              <TableHead>Valor Investido</TableHead>
              <TableHead>Data Compra</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.miles_programs?.name || 'N/A'}
                </TableCell>
                <TableCell>{item.suppliers?.name || 'N/A'}</TableCell>
                <TableCell>{item.quantity.toLocaleString()}</TableCell>
                <TableCell>{item.remaining_quantity.toLocaleString()}</TableCell>
                <TableCell>R$ {item.cost_per_thousand.toFixed(2)}</TableCell>
                <TableCell>R$ {item.purchase_value.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(item.purchase_date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(item.status, item.remaining_quantity)}>
                    {getStatusText(item.status, item.remaining_quantity)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <MilesInventoryActions item={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {inventory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum estoque de milhas encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};