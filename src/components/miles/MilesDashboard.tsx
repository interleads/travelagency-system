import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { useMilesInventory } from '@/hooks/useMilesInventory';
import { MilesInventoryTable } from './MilesInventoryTable';

export const MilesDashboard = () => {
  const { data: inventory = [], isLoading } = useMilesInventory();

  // Calculate metrics
  const totalInvestment = inventory.reduce((sum, item) => sum + item.purchase_value, 0);
  const totalMiles = inventory.reduce((sum, item) => sum + item.remaining_quantity, 0);
  const activePrograms = new Set(inventory.filter(item => item.status === 'Ativo').map(item => item.program_id)).size;
  const lowStockItems = inventory.filter(item => item.remaining_quantity < 10000).length;

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Imobilizado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalInvestment.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total investido em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Milhas disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes programas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Itens abaixo de 10k milhas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <MilesInventoryTable />
    </div>
  );
};