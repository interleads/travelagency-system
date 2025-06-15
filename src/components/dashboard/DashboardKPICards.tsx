
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ListChecks, BarChart, Briefcase, Percent, DollarSign } from "lucide-react";

// Dados simulados para KPIs (os valores reais viriam do backend ou via props/hook)
const metrics = [
  {
    label: "Faturamento",
    value: "R$ 328.000",
    icon: TrendingUp,
    bg: "from-emerald-500 to-teal-400",
    description: "Valor total vendido no período",
  },
  {
    label: "Vendas",
    value: "247",
    icon: ListChecks,
    bg: "from-sky-600 to-cyan-400",
    description: "Quantidade de vendas realizadas",
  },
  {
    label: "Ticket Médio",
    value: "R$ 1.328",
    icon: BarChart,
    bg: "from-sky-500 to-indigo-400",
    description: "Média por venda",
  },
  {
    label: "Pacotes",
    value: "108",
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
    value: "R$ 97.000",
    icon: DollarSign,
    bg: "from-lime-500 to-green-400",
    description: "Valor total do lucro",
  },
];

export default function DashboardKPICards() {
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
