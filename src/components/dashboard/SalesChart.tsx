
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const data = [
  { month: "Jan", vendas: 32000 },
  { month: "Fev", vendas: 41000 },
  { month: "Mar", vendas: 38500 },
  { month: "Abr", vendas: 47500 },
  { month: "Mai", vendas: 67000 },
  { month: "Jun", vendas: 72440 },
];

export default function SalesChart() {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Vendas dos últimos 6 meses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="month" tick={{ fill: "#082f49", fontSize: 13 }} />
              <YAxis tick={{ fill: "#082f49", fontSize: 13 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="#0ea5e9"
                fill="url(#colorSales)"
                strokeWidth={3}
                dot={{ stroke: "#0ea5e9", strokeWidth: 2, fill: "#fff", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
