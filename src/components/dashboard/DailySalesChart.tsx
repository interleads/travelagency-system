
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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

// Mock de meses disponíveis, cobre dois anos
const months = [];
for (let y = 2023; y <= 2024; y++) {
  for (let m = 1; m <= 12; m++) {
    months.push({
      label: `${format(new Date(y, m - 1, 1), "MMMM yyyy")}`,
      value: `${y}-${String(m).padStart(2, "0")}`,
    });
  }
}

// Gera dados diários, igual aos do DashboardKPICards
function generateMockSales(month: string) {
  const year = Number(month.split("-")[0]);
  const m = Number(month.split("-")[1]) - 1;
  const days = new Date(year, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const dt = new Date(year, m, i + 1);
    const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
    return {
      date: dt,
      day: i + 1,
      sales: isWeekend ? 0 : Math.floor(Math.random() * 7000) + 1200,
    };
  });
}

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
          day: day,
          sales: isWeekend ? 0 : Math.floor(Math.random() * 7000) + 1200,
          month: `${year}-${String(month + 1).padStart(2, "0")}`,
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

  // Default: mês mais recente elegível dentro do filtro
  const initialMonth = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to)
      return months[months.length - 1].value;
    const relevantMonth = months.find(
      (m) =>
        new Date(m.value + "-01") >= dateRange.from &&
        new Date(m.value + "-01") <= dateRange.to
    );
    return relevantMonth ? relevantMonth.value : months[months.length - 1].value;
  }, [dateRange]);

  const [selectedMonth, setSelectedMonth] = React.useState(initialMonth);

  // Atualiza o mês quando mudam o filtro
  React.useEffect(() => {
    setSelectedMonth(initialMonth);
  }, [initialMonth]);

  // Dados do mês atual SELECIONADO, mas filtrados pelo dateRange global
  const monthData = React.useMemo(() => {
    // pega todos os dias do mês
    let data = allSalesData.filter((d) => d.month === selectedMonth);
    // Aplica filtro do calendar
    if (dateRange?.from && dateRange?.to) {
      data = data.filter((d) => isWithin(d.date, dateRange.from, dateRange.to));
    }
    return data;
  }, [selectedMonth, dateRange]);

  const monthLabel =
    months.find((m) => m.value === selectedMonth)?.label ?? "";

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-end gap-2 p-4">
        <div className="w-52">
          <label htmlFor="month-select" className="sr-only">
            Mês
          </label>
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
            aria-label="Selecionar mês"
          >
            <SelectTrigger id="month-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem value={m.value} key={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData}>
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
                dataKey="day"
                tick={{ fill: "#082f49", fontSize: 12 }}
                label={{ value: "Dia", fill: "#082f49", dy: 10 }}
                interval={4}
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
                labelFormatter={(label) => `Dia ${label}`}
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
