import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales, type SaleProductDb } from "@/hooks/useSales";
import { useDateRangeFilter } from "@/components/shared/useDateRangeFilter";
import { TrendingUp, TrendingDown, DollarSign, Calculator, BarChart3 } from "lucide-react";

interface SalesOverviewCardsProps {
  activeTab: string;
}

export function SalesOverviewCards({ activeTab }: SalesOverviewCardsProps) {
  const { dateRange } = useDateRangeFilter();
  const { data: sales = [], isLoading } = useSales(dateRange);
  
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  
  // Calcular custo total e lucro bruto - corrigido
  const totalCost = sales.reduce((sum, sale) => {
    const saleCost = sale.sale_products?.reduce((productSum: number, product: SaleProductDb) => {
      if (product.type === 'passagem' && product.miles && product.miles_cost) {
        // Para passagens com milhas: (qtdMilhas / 1000) * custoMil
        const milhasCost = (Number(product.miles) / 1000) * Number(product.miles_cost);
        return productSum + milhasCost;
      }
      // Para outros produtos e passagens tarifadas, usar campo cost
      return productSum + (Number(product.cost) || 0);
    }, 0) || 0;
    return sum + saleCost;
  }, 0);
  
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const salesThisMonth = sales.filter(sale => {
    const saleDate = new Date(sale.created_at);
    return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
  }).length;
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  const renderCards = () => {
    if (activeTab === "historico") {
      return (
        <>
          {/* Faturamento Total */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Faturamento Total
              </CardTitle>
              <div className="p-1 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-2 md:pb-6">
              <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="flex items-center space-x-1 text-[10px] md:text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-2 w-2 md:h-3 md:w-3 text-green-500" />
                <span>{totalSales} vendas realizadas</span>
              </div>
            </CardContent>
          </Card>

          {/* Custo Total */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Custo Total
              </CardTitle>
              <div className="p-1 md:p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Calculator className="h-3 w-3 md:h-4 md:w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-2 md:pb-6">
              <div className="text-lg md:text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalCost)}
              </div>
              <div className="flex items-center space-x-1 text-[10px] md:text-xs text-muted-foreground mt-1">
                <TrendingDown className="h-2 w-2 md:h-3 md:w-3 text-red-500" />
                <span>Custos operacionais</span>
              </div>
            </CardContent>
          </Card>

          {/* Lucro Bruto */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Lucro Bruto
              </CardTitle>
              <div className="p-1 md:p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-2 md:pb-6">
              <div className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(grossProfit)}
              </div>
              <div className="flex items-center space-x-1 text-[10px] md:text-xs text-muted-foreground mt-1">
                <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs ${
                  profitMargin >= 20 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  profitMargin >= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {profitMargin.toFixed(1)}% margem
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    if (activeTab === "crm") {
      return null;
    }

    if (activeTab === "relatorios") {
      return (
        <>
          <Card>
            <CardHeader className="pb-1 md:pb-6">
              <CardTitle className="text-sm md:text-base">Vendas no Período</CardTitle>
            </CardHeader>
            <CardContent className="pb-2 md:pb-6">
              <p className="text-xl md:text-3xl font-bold text-indigo-600">{totalSales}</p>
              <p className="text-xs md:text-sm text-gray-500">Período selecionado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1 md:pb-6">
              <CardTitle className="text-sm md:text-base">Crescimento</CardTitle>
            </CardHeader>
            <CardContent className="pb-2 md:pb-6">
              <p className="text-xl md:text-3xl font-bold text-teal-600">+12.3%</p>
              <p className="text-xs md:text-sm text-gray-500">vs mês anterior</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1 md:pb-6">
              <CardTitle className="text-sm md:text-base">Meta do Mês</CardTitle>
            </CardHeader>
            <CardContent className="pb-2 md:pb-6">
              <p className="text-xl md:text-3xl font-bold text-rose-600">78%</p>
              <p className="text-xs md:text-sm text-gray-500">Atingido</p>
            </CardContent>
          </Card>
        </>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-1 md:pb-3">
              <div className="h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </CardHeader>
            <CardContent className="pb-2 md:pb-6">
              <div className="h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1 md:mb-3" />
              <div className="h-2 md:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
      {renderCards()}
    </div>
  );
}