
import React from 'react';
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

const chartData = [
  { month: 'Jan', receitas: 45000, despesas: 32000 },
  { month: 'Fev', receitas: 52000, despesas: 38000 },
  { month: 'Mar', receitas: 48000, despesas: 35000 },
  { month: 'Abr', receitas: 61000, despesas: 42000 },
  { month: 'Mai', receitas: 55000, despesas: 39000 },
  { month: 'Jun', receitas: 67000, despesas: 45000 }
];

export function FinanceChart() {
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
              <YAxis />
              <Tooltip />
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
