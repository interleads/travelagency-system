
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from "recharts";
import { useTransactions } from "@/hooks/useTransactions";

export function FinanceChart() {
  const { data: transactions = [], isLoading } = useTransactions();
  
  const chartData = useMemo(() => {
    if (!transactions.length) return [];
    
    // Group transactions by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          receitas: 0,
          despesas: 0
        };
      }
      
      if (transaction.type === 'receita') {
        acc[monthKey].receitas += Number(transaction.value);
      } else {
        acc[monthKey].despesas += Number(transaction.value);
      }
      
      return acc;
    }, {} as Record<string, { month: string; receitas: number; despesas: number }>);
    
    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([_, data]) => data);
  }, [transactions]);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resultados Financeiros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resultados Financeiros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="#10B981" name="Receitas" />
              <Line type="monotone" dataKey="despesas" stroke="#EF4444" name="Despesas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
