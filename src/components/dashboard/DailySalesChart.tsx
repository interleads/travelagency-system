
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
import { format, parseISO } from "date-fns";
import { useDashboardDateRange } from "./useDashboardDateRange";
import { useSales } from "@/hooks/useSales";

// Agrupa vendas por data e soma o total
function groupSalesByDate(sales: any[]) {
  const grouped = sales.reduce((acc, sale) => {
    // Usa sale_date se disponível, senão created_at
    const dateKey = sale.sale_date ? 
      format(parseISO(sale.sale_date), 'yyyy-MM-dd') : 
      format(new Date(sale.created_at), 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: sale.sale_date ? parseISO(sale.sale_date) : new Date(sale.created_at),
        sales: 0
      };
    }
    acc[dateKey].sales += Number(sale.total_amount);
    return acc;
  }, {} as Record<string, { date: Date; sales: number }>);

  return Object.values(grouped).sort((a: { date: Date; sales: number }, b: { date: Date; sales: number }) => 
    a.date.getTime() - b.date.getTime()
  );
}

export default function DailySalesChart() {
  const { dateRange } = useDashboardDateRange();
  const { data: sales, isLoading } = useSales(dateRange);

  const chartData = React.useMemo(() => {
    if (!sales || sales.length === 0) {
      return [];
    }
    return groupSalesByDate(sales);
  }, [sales]);

  // Intervalo dinâmico para o eixo X baseado na quantidade de pontos
  const barCount = chartData.length;
  let xAxisInterval: number | "preserveStartEnd" = "preserveStartEnd";
  if (barCount > 60) {
    xAxisInterval = Math.ceil(barCount / 16); // Reduz a quantidade de labels
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent>
          <div className="h-72 flex items-center justify-center">
            <p className="text-gray-500">Carregando dados de vendas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent>
          <div className="h-72 flex items-center justify-center">
            <p className="text-gray-500">Nenhuma venda encontrada no período selecionado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent>
        <div className="h-64 sm:h-72">
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
