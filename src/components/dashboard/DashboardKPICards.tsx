
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ListChecks, BarChart, Briefcase, Percent, DollarSign } from "lucide-react";
import { useDashboardDateRange } from "./useDashboardDateRange";

// Gera dados simulado de vendas diárias cobrindo 2 anos
function generateMockData() {
  const data = [];
  const start = new Date("2023-01-01");
  const end = new Date("2024-12-31");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    data.push({
      date: new Date(d),
      sales: isWeekend ? 0 : Math.floor(Math.random() * 7000) + 1200,
      packages: isWeekend ? 0 : Math.floor(Math.random() * 5) + 1,
    });
  }
  return data;
}
// Dados simulados "globais"
const allData = generateMockData();

function filterDataByRange(data, range) {
  if (!range?.from || !range?.to) return data;
  return data.filter(
    (item) =>
      item.date >= range.from &&
      item.date <= range.to
  );
}

function calculateMetrics(filtered) {
  const totalSales = filtered.reduce((acc, curr) => acc + curr.sales, 0);
  const numSales = filtered.filter(item => item.sales > 0).length;
  const avgTicket = numSales ? totalSales / numSales : 0;
  const totalPackages = filtered.reduce((acc, curr) => acc + curr.packages, 0);
  const profitPercent = 0.296; // fixo, simulado
  const profit = totalSales * profitPercent;

  return [
    {
      label: "Faturamento",
      value: `R$ ${totalSales.toLocaleString("pt-BR")}`,
      icon: TrendingUp,
      bg: "from-emerald-500 to-teal-400",
      description: "Valor total vendido no período",
    },
    {
      label: "Vendas",
      value: numSales.toLocaleString("pt-BR"),
      icon: ListChecks,
      bg: "from-sky-600 to-cyan-400",
      description: "Quantidade de vendas realizadas",
    },
    {
      label: "Ticket Médio",
      value: `R$ ${avgTicket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      icon: BarChart,
      bg: "from-sky-500 to-indigo-400",
      description: "Média por venda",
    },
    {
      label: "Pacotes",
      value: totalPackages.toLocaleString("pt-BR"),
      icon: Briefcase,
      bg: "from-orange-400 to-yellow-400",
      description: "Pacotes vendidos",
    },
    {
      label: "Margem de Lucro",
      value: "29.6%",
      icon: Percent,
      bg: "from-purple-500 to-indigo-400",
      description: "Percentual de lucro",
    },
    {
      label: "Receita Bruta (Lucro)",
      value: `R$ ${profit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      bg: "from-lime-500 to-green-400",
      description: "Valor total do lucro",
    },
  ];
}

export default function DashboardKPICards() {
  const { dateRange } = useDashboardDateRange();
  const filtered = React.useMemo(
    () => filterDataByRange(allData, dateRange),
    [dateRange]
  );
  const metrics = React.useMemo(() => calculateMetrics(filtered), [filtered]);

  return (
    <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m, i) => (
        <Card
          key={i}
          className="bg-gradient-to-br shadow-lg border-0 text-white relative overflow-hidden"
          style={{ backgroundImage: `linear-gradient(135deg,var(--tw-gradient-stops))` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${m.bg} opacity-90`} />
          <CardContent className="relative flex flex-col gap-1 z-10">
            <div className="flex items-center justify-between mt-6">
              <span className="text-lg font-medium">{m.label}</span>
              <m.icon className="w-8 h-8 opacity-75" />
            </div>
            <div className="text-3xl font-bold my-2">{m.value}</div>
            <span className="text-white/80 text-xs">{m.description}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
