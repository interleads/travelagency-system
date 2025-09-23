import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/hooks/useSales";

export function SalesOverviewCards() {
  const { data: sales = [], isLoading } = useSales();
  
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  
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
      <Card>
        <CardHeader>
          <CardTitle>Vendas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{salesThisMonth}</p>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Receita Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-600">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-sm text-gray-500">{totalSales} vendas</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ticket Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-amber-600">
            {formatCurrency(averageTicket)}
          </p>
          <p className="text-sm text-gray-500">Por venda</p>
        </CardContent>
      </Card>
    </div>
  );
}