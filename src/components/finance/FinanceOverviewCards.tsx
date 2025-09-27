
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";

export function FinanceOverviewCards() {
  const { data: transactions = [], isLoading } = useTransactions();
  
  const receitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + Number(t.value), 0);
    
  const despesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + Number(t.value), 0);
    
  const balanco = receitas - despesas;
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-1 md:pb-6">
              <div className="h-4 md:h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="pb-2 md:pb-6">
              <div className="h-6 md:h-8 bg-gray-200 rounded animate-pulse mb-1 md:mb-2" />
              <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
      <Card>
        <CardHeader className="pb-1 md:pb-6">
          <CardTitle className="text-sm md:text-base">Balanço Total</CardTitle>
        </CardHeader>
        <CardContent className="pb-2 md:pb-6">
          <p className={`text-xl md:text-3xl font-bold ${balanco >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(balanco)}
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            Atualizado em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-1 md:pb-6">
          <CardTitle className="text-sm md:text-base">Receitas</CardTitle>
        </CardHeader>
        <CardContent className="pb-2 md:pb-6">
          <p className="text-xl md:text-3xl font-bold text-sky-600">
            {formatCurrency(receitas)}
          </p>
          <p className="text-xs md:text-sm text-gray-500">Total acumulado</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-1 md:pb-6">
          <CardTitle className="text-sm md:text-base">Despesas</CardTitle>
        </CardHeader>
        <CardContent className="pb-2 md:pb-6">
          <p className="text-xl md:text-3xl font-bold text-red-600">
            {formatCurrency(despesas)}
          </p>
          <p className="text-xs md:text-sm text-gray-500">Total acumulado</p>
        </CardContent>
      </Card>
    </div>
  );
}
