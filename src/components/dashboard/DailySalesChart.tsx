
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Select } from "@/components/ui/select";
import { format } from "date-fns";

// Mock de meses e dados de vendas diárias (em produção, use dados do backend)
const months = [
  { label: "Janeiro 2024", value: "2024-01" },
  { label: "Fevereiro 2024", value: "2024-02" },
  { label: "Março 2024", value: "2024-03" },
  { label: "Abril 2024", value: "2024-04" },
  { label: "Maio 2024", value: "2024-05" },
  { label: "Junho 2024", value: "2024-06" },
];

function generateMockSales(month: string) {
  const days = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
  // Simula vendas diárias, alguns dias de fim de semana zerados
  return Array.from({ length: days }, (_, i) => {
    const dt = new Date(`${month}-${String(i + 1).padStart(2, "0")}`);
    const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
    return {
      date: dt,
      day: i + 1,
      sales: isWeekend ? 0 : Math.floor(Math.random() * 7000) + 1200,
    };
  });
}

export default function DailySalesChart() {
  const [selectedMonth, setSelectedMonth] = React.useState(months[months.length - 1].value);
  const data = React.useMemo(() => generateMockSales(selectedMonth), [selectedMonth]);
  const monthLabel = months.find(m => m.value === selectedMonth)?.label ?? "";

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <CardTitle className="text-lg">Vendas Diárias</CardTitle>
        <div>
          <label className="sr-only" htmlFor="month-selector">Mês</label>
          <Select id="month-selector" value={selectedMonth} onValueChange={setSelectedMonth}>
            {months.map(m => (
              <option value={m.value} key={m.value}>{m.label}</option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#082f49", fontSize: 12 }}
                label={{ value: "Dia", fill: "#082f49", dy: 10 }}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#082f49", fontSize: 12 }}
                label={{ value: "Vendas (R$)", angle: -90, position: "insideLeft", fill: "#082f49", dx: -10 }}
              />
              <Tooltip
                formatter={value => `R$ ${Number(value).toLocaleString("pt-BR")}`}
                labelFormatter={label => `Dia ${label}`}
              />
              <Bar
                dataKey="sales"
                fill="url(#barColor)"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-right">
          {monthLabel}
        </div>
      </CardContent>
    </Card>
  );
}
