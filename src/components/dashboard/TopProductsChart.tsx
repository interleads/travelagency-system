
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const data = [
  { product: "Cancún", vendas: 18 },
  { product: "Paris", vendas: 15 },
  { product: "Roma", vendas: 11 },
  { product: "Orlando", vendas: 9 },
  { product: "Maceió", vendas: 8 },
];

const colors = [
  "#14b8a6",
  "#6366f1",
  "#eab308",
  "#f472b6",
  "#38bdf8"
];

export default function TopProductsChart() {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Top Pacotes Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="product" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="vendas" barSize={22} radius={[12,12,12,12]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
