
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from "recharts";

const salesData = [
  { month: 'Jan', vendas: 45, lucro: 13 },
  { month: 'Fev', vendas: 52, lucro: 16 },
  { month: 'Mar', vendas: 48, lucro: 14 },
  { month: 'Abr', vendas: 61, lucro: 19 },
  { month: 'Mai', vendas: 55, lucro: 17 },
  { month: 'Jun', vendas: 67, lucro: 22 }
];

export default function FinancialAnalysisChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={salesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="vendas" fill="#10B981" name="Receitas (k)" />
        <Bar dataKey="lucro" fill="#EF4444" name="Lucro (k)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
