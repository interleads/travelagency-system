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

  // Airline logos mapping
  const airlineLogos: { [key: string]: string } = {
    'Azul': '/assets/airlines/azul.png',
    'Smiles': '/assets/airlines/gol.png',
    'Latam': '/assets/airlines/latam.png',
    'TAP': '/assets/airlines/tap.png'
  };

  // Airline theme colors mapping
  const airlineThemes: { [key: string]: { border: string; icon: string; text: string } } = {
    'Azul': { border: 'border-l-blue-600', icon: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    'Smiles': { border: 'border-l-orange-500', icon: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    'Latam': { border: 'border-l-purple-600', icon: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    'TAP': { border: 'border-l-red-500', icon: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }
  };

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
        {programData.map((program) => {
          const theme = airlineThemes[program.name] || { border: 'border-l-primary', icon: 'bg-primary/10', text: 'text-primary' };
          const logoSrc = airlineLogos[program.name];
          
          return (
            <Card key={program.id} className={`relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 ${theme.border} hover:shadow-lg transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{program.name}</CardTitle>
                <div className={`p-3 ${theme.icon} rounded-full flex items-center justify-center`}>
                  {logoSrc ? (
                    <img 
                      src={logoSrc} 
                      alt={`${program.name} logo`}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <Package className={`h-6 w-6 ${theme.text}`} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${theme.text}`}>{program.totalMiles.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  R$ {program.totalInvestment.toFixed(2)} investido
                </p>
                {program.isLowStock && program.totalMiles > 0 && (
                  <div className="flex items-center text-xs mt-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Estoque baixo
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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
        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Fornecedores</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Fornecedores ativos
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capital Imobilizado</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {totalInvestment.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total investido
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custo Médio</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">R$ {avgCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Por mil milhas
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Programas Ativos</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{activePrograms}</div>
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