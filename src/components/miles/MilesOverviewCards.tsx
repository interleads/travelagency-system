import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { useMilesInventory, useMilesPrograms } from '@/hooks/useMilesInventory';
import { useDateRangeFilter } from '@/components/shared/useDateRangeFilter';

interface MilesOverviewCardsProps {
  activeTab: string;
}

export const MilesOverviewCards = ({ activeTab }: MilesOverviewCardsProps) => {
  const { dateRange } = useDateRangeFilter();
  const { data: inventory = [], isLoading: inventoryLoading } = useMilesInventory(dateRange);
  const { data: programs = [], isLoading: programsLoading } = useMilesPrograms();

  if (inventoryLoading || programsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activeTab === "inventory") {
    // Group inventory by program
    const programData = programs.map(program => {
      const programInventory = inventory.filter(item => item.program_id === program.id);
      const totalMiles = programInventory.reduce((sum, item) => sum + item.remaining_quantity, 0);
      const totalInvestment = programInventory.reduce((sum, item) => sum + item.purchase_value, 0);
      const isLowStock = totalMiles < 10000;
      
      return {
        id: program.id,
        name: program.name,
        totalMiles,
        totalInvestment,
        isLowStock,
        itemCount: programInventory.length
      };
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {programData.map((program) => (
          <Card key={program.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{program.name}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{program.totalMiles.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                R$ {program.totalInvestment.toFixed(2)} investido
              </p>
              {program.isLowStock && program.totalMiles > 0 && (
                <div className="flex items-center text-xs text-yellow-600 mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Estoque baixo
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activeTab === "suppliers") {
    // Summary cards for suppliers tab
    const totalSuppliers = new Set(inventory.map(item => item.supplier_id)).size;
    const totalInvestment = inventory.reduce((sum, item) => sum + item.purchase_value, 0);
    const avgCost = inventory.length > 0 ? 
      inventory.reduce((sum, item) => sum + item.cost_per_thousand, 0) / inventory.length : 0;
    const activePrograms = new Set(inventory.filter(item => item.status === 'Ativo').map(item => item.program_id)).size;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fornecedores</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Fornecedores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Imobilizado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalInvestment.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total investido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {avgCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Por mil milhas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms}</div>
            <p className="text-xs text-muted-foreground">
              Com estoque ativo
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};