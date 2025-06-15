
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { useDashboardDateRange } from "./useDashboardDateRange";

// Gera dados de todos dias dos dois anos (para filtrar depois)
function generateFullSalesData() {
  const data = [];
  for (let year = 2023; year <= 2024; year++) {
    for (let month = 0; month < 12; month++) {
      const days = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= days; day++) {
        const dt = new Date(year, month, day);
        const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
        data.push({
          date: dt,
          sales: isWeekend ? 0 : Math.floor(Math.random() * 7000) + 1200,
        });
      }
    }
  }
  return data;
}
const allSalesData = generateFullSalesData();

function isWithin(date, from, to) {
  if (!from || !to) return true;
  return date >= from && date <= to;
}

export default function DailySalesChart() {
  const { dateRange } = useDashboardDateRange();

  // Novo filtro: mostra todos dados se from e to indefinidos
  const chartData = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return allSalesData;
    }
    return allSalesData.filter((d) => isWithin(d.date, dateRange.from, dateRange.to));
  }, [dateRange]);

  // Intervalo dinâmico para o eixo X baseado na quantidade de pontos
  const barCount = chartData.length;
  let xAxisInterval: number | "preserveStartEnd" = "preserveStartEnd";
  if (barCount > 60) {
    xAxisInterval = Math.ceil(barCount / 16); // Reduz a quantidade de labels
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <defs>
                <linearGradient
                  id="barColor"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(date, "dd/MM")}
                tick={{ fill: "#082f49", fontSize: 12 }}
                label={{
                  value: "Dia",
                  fill: "#082f49",
                  dy: 10,
                }}
                interval={xAxisInterval}
                minTickGap={10}
              />
              <YAxis
                tick={{ fill: "#082f49", fontSize: 12 }}
                label={{
                  value: "Vendas (R$)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#082f49",
                  dx: -10,
                }}
              />
              <Tooltip
                formatter={(value) =>
                  `R$ ${Number(value).toLocaleString("pt-BR")}`
                }
                labelFormatter={(_, payload) =>
                  payload && payload[0]
                    ? `Dia ${format(payload[0].payload.date, "dd/MM/yyyy")}`
                    : ""
                }
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
      </CardContent>
    </Card>
  );
}
