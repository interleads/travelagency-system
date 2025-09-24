import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/hooks/useSales";
import { TrendingUp, TrendingDown, DollarSign, Calculator, BarChart3 } from "lucide-react";

interface SalesOverviewCardsProps {
  activeTab: string;
}

export function SalesOverviewCards({ activeTab }: SalesOverviewCardsProps) {
  const { data: sales = [], isLoading } = useSales();
  
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Calcular custo total e lucro bruto
  const totalCost = sales.reduce((sum, sale) => {
    const saleCost = sale.sale_products?.reduce((productSum: number, product: any) => {
      if (product.type === 'passagem') {
        if (product.miles && product.miles_cost) {
          return productSum + Number(product.miles_cost);
        }
        return productSum + (Number(product.cost) || 0);
      }
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento Total
              </CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>{totalSales} vendas realizadas</span>
              </div>
            </CardContent>
          </Card>

          {/* Custo Total */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo Total
              </CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Calculator className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalCost)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span>Custos operacionais</span>
              </div>
            </CardContent>
          </Card>

          {/* Lucro Bruto */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro Bruto
              </CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(grossProfit)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
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
      return (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total de Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">127</p>
              <p className="text-sm text-gray-500">Leads ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">23.5%</p>
              <p className="text-sm text-gray-500">Últimos 30 dias</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Próximos Follow-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">18</p>
              <p className="text-sm text-gray-500">Esta semana</p>
            </CardContent>
          </Card>
        </>
      );
    }

    if (activeTab === "relatorios") {
      return (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Vendas no Período</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-600">{totalSales}</p>
              <p className="text-sm text-gray-500">Período selecionado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-teal-600">+12.3%</p>
              <p className="text-sm text-gray-500">vs mês anterior</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Meta do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-rose-600">78%</p>
              <p className="text-sm text-gray-500">Atingido</p>
            </CardContent>
          </Card>
        </>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {renderCards()}
    </div>
  );
}